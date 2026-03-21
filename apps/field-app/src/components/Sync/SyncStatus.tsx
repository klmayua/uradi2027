import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSyncStore from '@stores/syncStore';

const SyncStatus: React.FC = () => {
  const { isSyncing, pendingCount, syncError, isOnline, sync, clearSyncError } = useSyncStore();

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        sync();
      }, 5000); // Wait 5 seconds after coming online

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, isSyncing]);

  if (!isOnline) {
    return (
      <View style={[styles.container, styles.offlineContainer]}>
        <Ionicons name="cloud-offline" size={16} color="#FF0000" />
        <Text style={styles.offlineText}>Offline Mode</Text>
        {pendingCount > 0 && (
          <Text style={styles.pendingText}>{pendingCount} pending</Text>
        )}
      </View>
    );
  }

  if (syncError) {
    return (
      <TouchableOpacity style={[styles.container, styles.errorContainer]} onPress={clearSyncError}>
        <Ionicons name="alert-circle" size={16} color="#FF0000" />
        <Text style={styles.errorText}>Sync Error</Text>
        <Text style={styles.retryText}>Tap to dismiss</Text>
      </TouchableOpacity>
    );
  }

  if (isSyncing) {
    return (
      <View style={[styles.container, styles.syncingContainer]}>
        <Ionicons name="sync" size={16} color="#D4AF37" style={styles.spinningIcon} />
        <Text style={styles.syncingText}>Syncing...{pendingCount > 0 && ` (${pendingCount})`}</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <TouchableOpacity style={[styles.container, styles.pendingContainer]} onPress={sync}>
        <Ionicons name="cloud-upload" size={16} color="#D4AF37" />
        <Text style={styles.pendingText}>{pendingCount} pending - Tap to sync</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, styles.syncedContainer]}>
      <Ionicons name="checkmark-circle" size={16} color="#00FF00" />
      <Text style={styles.syncedText}>All synced</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  offlineContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  offlineText: {
    color: '#FF0000',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: '#FF0000',
    marginLeft: 8,
    fontWeight: '600',
  },
  retryText: {
    color: '#FF6666',
    marginLeft: 8,
    fontSize: 12,
  },
  syncingContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  syncingText: {
    color: '#D4AF37',
    marginLeft: 8,
    fontWeight: '600',
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
  },
  pendingContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  pendingText: {
    color: '#D4AF37',
    marginLeft: 8,
    fontWeight: '600',
  },
  syncedContainer: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  syncedText: {
    color: '#00FF00',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default SyncStatus;
