import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

import { getCurrentLocation, isWithinPollingUnit, getDeviceInfo, getNTPTimestamp } from '@services/gps';
import { calculateImageHash } from '@utils/crypto';
import { getDatabase } from '@database';
import useAuthStore from '@stores/authStore';

const EvidenceCaptureScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('accreditation');

  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();

  // Get polling unit from route params or use first available
  const [pollingUnit, setPollingUnit] = useState<any>(null);

  useEffect(() => {
    const loadPollingUnit = async () => {
      const db = getDatabase();
      const params = route.params as any;

      if (params?.puId) {
        const pu = await db.get('polling_units').find(params.puId);
        setPollingUnit(pu);
      } else {
        // Get nearest polling unit
        const units = await db.get('polling_units').query().fetch();
        if (units.length > 0) {
          const location = await getCurrentLocation();
          let nearest = units[0];
          let minDistance = Infinity;

          for (const unit of units) {
            const distance = Math.sqrt(
              Math.pow(unit.latitude - location.latitude, 2) +
                Math.pow(unit.longitude - location.longitude, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearest = unit;
            }
          }
          setPollingUnit(nearest);
        }
      }
    };

    loadPollingUnit();
  }, []);

  // Check GPS location
  useEffect(() => {
    const checkLocation = async () => {
      if (!pollingUnit) return;

      try {
        const location = await getCurrentLocation();
        setGpsAccuracy(location.accuracy);

        const { isWithin } = isWithinPollingUnit(
          location,
          pollingUnit.latitude,
          pollingUnit.longitude,
          100 // 100m radius
        );
        setIsWithinRange(isWithin);
      } catch (error) {
        console.error('Location check failed:', error);
      }
    };

    checkLocation();
    const interval = setInterval(checkLocation, 5000);
    return () => clearInterval(interval);
  }, [pollingUnit]);

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#D4AF37" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to capture election evidence with forensic verification.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || !pollingUnit) return;

    // Check if within range
    if (!isWithinRange) {
      Alert.alert(
        'Too Far from Polling Unit',
        `You must be within 100 meters of ${pollingUnit.puName} to capture verified evidence.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: true,
      });

      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Capture failed:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const saveEvidence = async () => {
    if (!capturedImage || !pollingUnit || !user) return;

    setIsUploading(true);

    try {
      // Get GPS and device data
      const [location, deviceInfo, ntpTime] = await Promise.all([
        getCurrentLocation(),
        getDeviceInfo(),
        getNTPTimestamp(),
      ]);

      // Calculate image hash
      const imageHash = await calculateImageHash(capturedImage);

      // Copy image to app documents
      const fileName = `evidence_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}evidence/${fileName}`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}evidence`, {
        intermediates: true,
      });
      await FileSystem.copyAsync({ from: capturedImage, to: localUri });

      // Save to database
      const db = getDatabase();
      await db.write(async () => {
        await db.get('evidence').create((record: any) => {
          record.pollingUnitId = pollingUnit.id;
          record.monitorId = user.id;
          record.evidenceType = selectedType;
          record.localUri = localUri;
          record.imageHash = imageHash;
          record.latitude = location.latitude;
          record.longitude = location.longitude;
          record.gpsAccuracy = location.accuracy;
          record.altitude = location.altitude;
          record.capturedAt = new Date();
          record.ntpTimestamp = ntpTime.toString();
          record.deviceFingerprint = deviceInfo.fingerprint;
          record.deviceModel = deviceInfo.model;
          record.osVersion = deviceInfo.osVersion;
          record.appVersion = deviceInfo.appVersion;
          record.forensicStatus = 'pending';
          record.syncStatus = 'pending';
          record.uploadQueuePosition = 0;
          record.retryCount = 0;
        });
      });

      // Navigate to preview
      navigation.navigate('EvidencePreview', {
        imageUri: localUri,
        metadata: {
          pollingUnit: pollingUnit.puName,
          type: selectedType,
          timestamp: new Date().toISOString(),
          gps: `${location.latitude}, ${location.longitude}`,
          accuracy: location.accuracy,
        },
      });
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to save evidence. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />

        <View style={styles.previewOverlay}>
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>{pollingUnit?.puName}</Text>
            <Text style={styles.metadataSubtext}>{selectedType.toUpperCase()}</Text>
            {gpsAccuracy && (
              <Text style={styles.metadataSubtext}>GPS Accuracy: {gpsAccuracy.toFixed(1)}m</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setCapturedImage(null)}
              disabled={isUploading}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={saveEvidence}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Save Evidence</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Overlay UI */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.puBadge}>
              <Text style={styles.puText}>{pollingUnit?.puCode || 'Loading...'}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isWithinRange ? styles.statusSuccess : styles.statusError,
              ]}
            >
              <Ionicons
                name={isWithinRange ? 'checkmark-circle' : 'location'}
                size={16}
                color={isWithinRange ? '#00FF00' : '#FF0000'}
              />
              <Text
                style={[
                  styles.statusText,
                  isWithinRange ? styles.statusSuccessText : styles.statusErrorText,
                ]}
              >
                {isWithinRange ? 'In Range' : 'Too Far'}
              </Text>
            </View>
          </View>

          {/* Evidence Type Selector */}
          <View style={styles.typeSelector}>
            {['accreditation', 'voting', 'counting', 'result', 'incident'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextActive]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GPS Info */}
          <View style={styles.gpsInfo}>
            <Ionicons name="location" size={16} color="#D4AF37" />
            <Text style={styles.gpsText}>
              {gpsAccuracy ? `Accuracy: ${gpsAccuracy.toFixed(1)}m` : 'Getting GPS...'}
            </Text>
          </View>

          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, !isWithinRange && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={!isWithinRange || isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#000000" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  puBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  puText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSuccess: {
    borderColor: '#00FF00',
  },
  statusError: {
    borderColor: '#FF0000',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  statusSuccessText: {
    color: '#00FF00',
  },
  statusErrorText: {
    color: '#FF0000',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 100,
    gap: 8,
  },
  typeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  typeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#000000',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  gpsText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4AF37',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  metadataContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  metadataText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  metadataSubtext: {
    color: '#999999',
    fontSize: 14,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#000000',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
  },
  secondaryButton: {
    backgroundColor: '#333333',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EvidenceCaptureScreen;
