import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema, tableNames } from './schema';
import {
  PollingUnit,
  User,
  Evidence,
  AccreditationRecord,
  VoteTally,
  ElectionDayIncident,
  SyncQueue,
  AppSettings,
} from './schema';

// Model registry
const modelClasses = [
  PollingUnit,
  User,
  Evidence,
  AccreditationRecord,
  VoteTally,
  ElectionDayIncident,
  SyncQueue,
  AppSettings,
];

// Database instance
let database: Database | null = null;

export const initDatabase = (): Database => {
  if (database) return database;

  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'uradi_field_app',
    jsi: true, // Use JSI for better performance
    onSetUpError: (error) => {
      console.error('Database setup error:', error);
    },
    onIndexedFieldsChange: (indexedFields) => {
      console.log('Indexed fields changed:', indexedFields);
    },
  });

  database = new Database({
    adapter,
    modelClasses,
    actionsEnabled: true,
  });

  return database;
};

export const getDatabase = (): Database => {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
};

// Database helpers
export const resetDatabase = async (): Promise<void> => {
  const db = getDatabase();
  await db.write(async () => {
    await db.unsafeResetDatabase();
  });
};

export const getPendingSyncCount = async (): Promise<number> => {
  const db = getDatabase();
  const records = await db.get('evidence').query().fetch();
  return records.filter((r: any) => r.syncStatus === 'pending').length;
};

export const clearSyncErrors = async (): Promise<void> => {
  const db = getDatabase();
  const collections = ['evidence', 'accreditation_records', 'vote_tallies', 'election_day_incidents'];

  await db.write(async () => {
    for (const collectionName of collections) {
      const records = await db.get(collectionName).query().fetch();
      for (const record of records) {
        if (record.syncStatus === 'error') {
          await record.update(() => {
            record.syncStatus = 'pending';
            record.syncError = null;
          });
        }
      }
    }
  });
};

export const getDatabaseStats = async (): Promise<Record<string, number>> => {
  const db = getDatabase();
  const stats: Record<string, number> = {};

  for (const tableName of tableNames) {
    const records = await db.get(tableName).query().fetch();
    stats[tableName] = records.length;
  }

  return stats;
};

export { Database };
export type { PollingUnit, User, Evidence, AccreditationRecord, VoteTally, ElectionDayIncident, SyncQueue, AppSettings };
