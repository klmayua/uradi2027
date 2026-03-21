import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { blockchainService } from '@services/blockchain';

const EvidenceVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { txHash } = route.params as { txHash: string };

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    timestamp?: number;
    metadataHash?: string;
  } | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      const result = await blockchainService.verifyEvidence(txHash);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const openExplorer = () => {
    const url = `https://polygonscan.com/tx/${txHash}`;
    Linking.openURL(url);
  };

  const openIPFS = () => {
    if (verificationResult?.metadataHash) {
      const url = blockchainService.getIPFSUrl(verificationResult.metadataHash);
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blockchain Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#00FF00" />
          </View>

          <Text style={styles.title}>Evidence Verified</Text>
          <Text style={styles.subtitle}>This evidence is anchored on the blockchain</Text>

          <View style={styles.txContainer}>
            <Text style={styles.txLabel}>Transaction Hash</Text>
            <Text style={styles.txHash} numberOfLines={2}>{txHash}</Text>
          </View>

          {verificationResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Status:</Text>
                <Text
                  style={[
                    styles.resultValue,
                    verificationResult.exists ? styles.success : styles.error,
                  ]}
                >
                  {verificationResult.exists ? 'Verified on Chain' : 'Not Found'}
                </Text>
              </View>

              {verificationResult.timestamp && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Anchored At:</Text>
                  <Text style={styles.resultValue}>
                    {new Date(verificationResult.timestamp * 1000).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {!verificationResult && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#000000" />
                  <Text style={styles.verifyButtonText}>Verify on Blockchain</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {verificationResult?.exists && (
            <>
              <TouchableOpacity style={styles.explorerButton} onPress={openExplorer}>
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.explorerButtonText}>View on PolygonScan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ipfsButton} onPress={openIPFS}>
                <Ionicons name="cloud" size={20} color="#FFFFFF" />
                <Text style={styles.ipfsButtonText}>View on IPFS</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What is Blockchain Verification?</Text>
          <Text style={styles.infoText}>
            Every piece of evidence is cryptographically hashed and anchored to the Polygon
            blockchain. This creates an immutable, timestamped record that cannot be altered
            or deleted, providing forensic proof of the evidence's authenticity.
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  txContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  txLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  txHash: {
    fontSize: 14,
    color: '#D4AF37',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  resultContainer: {
    width: '100%',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  success: {
    color: '#00FF00',
  },
  error: {
    color: '#FF0000',
  },
  actions: {
    marginTop: 24,
  },
  verifyButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  explorerButton: {
    backgroundColor: '#8247E5', // Polygon purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  explorerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  ipfsButton: {
    backgroundColor: '#65C2CB', // IPFS teal
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ipfsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 32,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
});

export default EvidenceVerificationScreen;
