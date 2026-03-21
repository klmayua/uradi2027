import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { blockchainService } from '@services/blockchain';
import { getDatabase } from '@database';
import useSyncStore from '@stores/syncStore';

const EvidencePreviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, metadata } = route.params as { imageUri: string; metadata: any };
  const { sync } = useSyncStore();

  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorStatus, setAnchorStatus] = useState<'pending' | 'anchoring' | 'complete' | 'error'>(
    'pending'
  );
  const [blockchainTx, setBlockchainTx] = useState<string | null>(null);

  const handleAnchor = async () => {
    setIsAnchoring(true);
    setAnchorStatus('anchoring');

    try {
      const result = await blockchainService.anchorEvidence(imageUri, {
        imageHash: '', // Will be calculated in service
        gps: metadata.gps,
        timestamp: new Date(metadata.timestamp).getTime(),
        deviceFingerprint: '', // From store
        pollingUnitCode: metadata.pollingUnit,
        evidenceType: metadata.type,
      });

      setBlockchainTx(result.txHash);
      setAnchorStatus('complete');

      // Update evidence record
      const db = getDatabase();
      const evidence = await db.get('evidence').query().fetch();
      const record = evidence.find((e: any) => e.localUri === imageUri);
      if (record) {
        await db.write(async () => {
          await record.update((r: any) => {
            r.blockchainTx = result.txHash;
            r.ipfsHash = result.ipfsHash;
            r.anchoredAt = new Date();
            r.syncStatus = 'pending';
          });
        });
      }

      // Trigger sync
      await sync();
    } catch (error) {
      console.error('Anchor failed:', error);
      setAnchorStatus('error');
      Alert.alert('Blockchain Anchor Failed', 'Evidence saved locally. Will retry sync.');
    } finally {
      setIsAnchoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Preview</Text>
        <View style={{ width: 24 }} />
      </View>

      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Forensic Metadata</Text>

        <View style={styles.row}>
          <Ionicons name="location" size={20} color="#D4AF37" />
          <View style={styles.rowContent}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{metadata.gps}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="time" size={20} color="#D4AF37" />
          <View style={styles.rowContent}>
            <Text style={styles.label}>Timestamp</Text>
            <Text style={styles.value}>{new Date(metadata.timestamp).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="flag" size={20} color="#D4AF37" />
          <View style={styles.rowContent}>
            <Text style={styles.label}>Polling Unit</Text>
            <Text style={styles.value}>{metadata.pollingUnit}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="camera" size={20} color="#D4AF37" />
          <View style={styles.rowContent}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{metadata.type}</Text>
          </View>
        </View>

        {anchorStatus === 'complete' && blockchainTx && (
          <View style={[styles.row, styles.blockchainRow]}>
            <Ionicons name="shield-checkmark" size={20} color="#00FF00" />
            <View style={styles.rowContent}>
              <Text style={styles.label}>Blockchain Verified</Text>
              <Text style={[styles.value, styles.txHash]} numberOfLines={1}>
                TX: {blockchainTx.slice(0, 20)}...
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {anchorStatus === 'pending' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleAnchor}>
            <Ionicons name="shield" size={20} color="#000000" />
            <Text style={styles.primaryButtonText}>Anchor to Blockchain</Text>
          </TouchableOpacity>
        )}

        {anchorStatus === 'anchoring' && (
          <View style={styles.loadingButton}>
            <ActivityIndicator color="#D4AF37" />
            <Text style={styles.loadingText}>Anchoring to Blockchain...</Text>
          </View>
        )}

        {anchorStatus === 'complete' && (
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => navigation.navigate('EvidenceVerification', { txHash: blockchainTx })}
          >
            <Ionicons name="checkmark-circle" size={20} color="#000000" />
            <Text style={styles.successButtonText}>View Verification</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.secondaryButtonText}>Back to Polling Units</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#111111',
  },
  infoCard: {
    backgroundColor: '#111111',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rowContent: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  blockchainRow: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  txHash: {
    color: '#00FF00',
    fontSize: 12,
  },
  actions: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingButton: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: '#00FF00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  successButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#999999',
    fontSize: 14,
  },
});

export default EvidencePreviewScreen;
