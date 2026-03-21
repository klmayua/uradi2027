import { create } from 'zustand';
import { getDatabase, Evidence, AccreditationRecord, VoteTally, ElectionDayIncident } from '@database';
import apiService from '@services/api';

interface SyncState {
  // State
  isSyncing: boolean;
  lastSync: number | null;
  pendingCount: number;
  syncError: string | null;
  isOnline: boolean;

  // Actions
  checkOnline: () => Promise<boolean>;
  sync: () => Promise<void>;
  queueForSync: (table: string, recordId: string, operation: 'create' | 'update' | 'delete') => Promise<void>;
  getPendingCount: () => Promise<number>;
  clearSyncError: () => void;
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  // Initial state
  isSyncing: false,
  lastSync: null,
  pendingCount: 0,
  syncError: null,
  isOnline: true,

  // Check if online
  checkOnline: async () => {
    try {
      const isOnline = await apiService.healthCheck();
      set({ isOnline });
      return isOnline;
    } catch {
      set({ isOnline: false });
      return false;
    }
  },

  // Sync data
  sync: async () => {
    const { isSyncing, checkOnline } = get();

    if (isSyncing) return;

    const isOnline = await checkOnline();
    if (!isOnline) {
      set({ syncError: 'No internet connection' });
      return;
    }

    set({ isSyncing: true, syncError: null });

    try {
      const db = getDatabase();
      const lastSync = get().lastSync || 0;

      // 1. Pull data from server
      const pullResponse = await apiService.syncPull(lastSync, [
        'polling_units',
        'accreditation_records',
        'vote_tallies',
        'election_day_incidents',
      ]);

      // Apply pulled changes to local database
      await db.write(async () => {
        for (const [table, records] of Object.entries(pullResponse.changes)) {
          const collection = db.get(table);
          for (const record of records as any[]) {
            const existing = await collection.find(record.id).catch(() => null);

            if (record._status === 'deleted') {
              if (existing) {
                await existing.destroyPermanently();
              }
            } else if (existing) {
              await existing.update((r: any) => {
                Object.assign(r, record);
                r.syncStatus = 'synced';
              });
            } else {
              await collection.create((r: any) => {
                Object.assign(r, record);
                r.syncStatus = 'synced';
              });
            }
          }
        }
      });

      // 2. Push local changes to server
      const tablesToPush = ['evidence', 'accreditation_records', 'vote_tallies', 'election_day_incidents'];
      const changes: any = {};

      for (const table of tablesToPush) {
        const collection = db.get(table);
        const pendingRecords = await collection
          .query()
          .filter((r: any) => r.syncStatus === 'pending' || r.syncStatus === 'error')
          .fetch();

        if (pendingRecords.length > 0) {
          changes[table] = pendingRecords.map((r: any) => ({
            id: r.id,
            ...r._raw,
            _status: r.remoteId ? 'updated' : 'created',
          }));
        }
      }

      if (Object.keys(changes).length > 0) {
        const pushResponse = await apiService.syncPush(changes, Date.now());

        // Update local records with server response
        await db.write(async () => {
          for (const [table, result] of Object.entries(pushResponse.results || {})) {
            const collection = db.get(table);
            for (const [id, serverRecord] of Object.entries(result as any)) {
              const localRecord = await collection.find(id).catch(() => null);
              if (localRecord) {
                await localRecord.update((r: any) => {
                  r.remoteId = (serverRecord as any).id;
                  r.syncStatus = 'synced';
                  r.syncError = null;
                });
              }
            }
          }
        });
      }

      // 3. Upload evidence images
      const evidenceCollection = db.get('evidence');
      const pendingEvidence = await evidenceCollection
        .query()
        .filter((r: any) => r.syncStatus === 'pending' && r.localUri)
        .fetch();

      for (const evidence of pendingEvidence) {
        try {
          const formData = new FormData();
          formData.append('polling_unit_id', evidence.pollingUnitId);
          formData.append('evidence_type', evidence.evidenceType);
          formData.append('latitude', evidence.latitude.toString());
          formData.append('longitude', evidence.longitude.toString());
          formData.append('gps_accuracy', evidence.gpsAccuracy.toString());
          formData.append('device_fingerprint', evidence.deviceFingerprint);

          // Add image file
          const filename = evidence.localUri.split('/').pop() || 'image.jpg';
          formData.append('photo', {
            uri: evidence.localUri,
            name: filename,
            type: 'image/jpeg',
          } as any);

          const response = await apiService.uploadEvidence(formData);

          await db.write(async () => {
            await evidence.update((r: any) => {
              r.remoteId = response.id;
              r.remoteUri = response.photo_url;
              r.ipfsHash = response.ipfs_hash;
              r.blockchainTx = response.blockchain_tx;
              r.forensicStatus = response.forensic_status;
              r.syncStatus = 'synced';
            });
          });
        } catch (error) {
          console.error('Failed to upload evidence:', error);
          await db.write(async () => {
            await evidence.update((r: any) => {
              r.syncStatus = 'error';
              r.syncError = error instanceof Error ? error.message : 'Upload failed';
              r.retryCount = (r.retryCount || 0) + 1;
            });
          });
        }
      }

      set({
        isSyncing: false,
        lastSync: Date.now(),
        pendingCount: 0,
        syncError: null,
      });
    } catch (error) {
      console.error('Sync error:', error);
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  },

  // Queue record for sync
  queueForSync: async (table, recordId, operation) => {
    const db = getDatabase();
    await db.write(async () => {
      const collection = db.get('sync_queue');
      await collection.create((record: any) => {
        record.tableName = table;
        record.recordId = recordId;
        record.operation = operation;
        record.priority = 1;
        record.retryCount = 0;
        record.createdAt = new Date();
      });
    });

    // Update pending count
    const pendingCount = await get().getPendingCount();
    set({ pendingCount });
  },

  // Get pending sync count
  getPendingCount: async () => {
    const db = getDatabase();
    const collections = ['evidence', 'accreditation_records', 'vote_tallies', 'election_day_incidents'];
    let count = 0;

    for (const table of collections) {
      const records = await db.get(table).query().fetch();
      count += records.filter((r: any) => r.syncStatus === 'pending').length;
    }

    set({ pendingCount: count });
    return count;
  },

  // Clear sync error
  clearSyncError: () => {
    set({ syncError: null });
  },
}));

export default useSyncStore;
