import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getCurrentLocation, isWithinPollingUnit, formatCoordinates } from '@services/gps';
import apiService from '@services/api';
import { getDatabase } from '@database';
import useAuthStore from '@stores/authStore';

const CheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { puId } = route.params as { puId: string };
  const { user } = useAuthStore();

  const [pollingUnit, setPollingUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    loadPollingUnit();
  }, []);

  const loadPollingUnit = async () => {
    try {
      const db = getDatabase();
      const pu = await db.get('polling_units').find(puId);
      setPollingUnit(pu);

      // Get current location
      const loc = await getCurrentLocation();
      setLocation({
        lat: loc.latitude,
        lng: loc.longitude,
        accuracy: loc.accuracy,
      });

      // Check if in range
      const { isWithin, distance: dist } = isWithinPollingUnit(
        loc,
        pu.latitude,
        pu.longitude,
        100
      );

      setIsInRange(isWithin);
      setDistance(dist);
    } catch (error) {
      console.error('Error loading polling unit:', error);
      Alert.alert('Error', 'Failed to load polling unit information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!location || !user) return;

    setIsCheckingIn(true);

    try {
      await apiService.checkIn(puId, location.lat, location.lng);

      Alert.alert(
        'Check-in Successful',
        `You have checked in at ${pollingUnit?.puName}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Check-in failed:', error);
      Alert.alert('Check-in Failed', 'Please try again');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}
          <View style={styles.puInfo}>
            <Text style={styles.puCode}>{pollingUnit?.puCode}</Text>
            <Text style={styles.puName}>{pollingUnit?.puName}</Text>
            <Text style={styles.puLocation}>
              {pollingUnit?.wardName}, {pollingUnit?.lgaName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationInfo}>
            <Text style={styles.sectionTitle}>Your Location</Text>

            {location ? (
              <>
                <View style={styles.coordRow}>
                  <Ionicons name="location" size={20} color="#D4AF37" />
                  <Text style={styles.coordText}>{formatCoordinates(location.lat, location.lng)}</Text>
                </View>

                <Text style={styles.accuracyText}>
                  GPS Accuracy: {location.accuracy.toFixed(1)} meters
                </Text>

                <View style={styles.distanceRow}>
                  <Text style={styles.distanceLabel}>Distance from Polling Unit:</Text>
                  <Text
                    style={[
                      styles.distanceValue,
                      isInRange ? styles.distanceSuccess : styles.distanceError,
                    ]}
                  >
                    {distance.toFixed(0)} meters
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isInRange ? styles.statusSuccess : styles.statusError,
                  ]}
                >
                  <Ionicons
                    name={isInRange ? 'checkmark-circle' : 'warning'}
                    size={20}
                    color={isInRange ? '#00FF00' : '#FF0000'}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isInRange ? styles.statusSuccessText : styles.statusErrorText,
                    ]}
                  >
                    {isInRange ? 'You are within range' : 'You are too far away'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.errorText}>Unable to get location. Please enable GPS.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkInButton,
            (!isInRange || isCheckingIn) && styles.checkInButtonDisabled,
          ]}
          onPress={handleCheckIn}
          disabled={!isInRange || isCheckingIn}
        >
          {isCheckingIn ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.checkInText}>Confirm Check In</Text>
          )}
        </TouchableOpacity>

        {!isInRange && (
          <Text style={styles.warningText}>
            You must be within 100 meters of the polling unit to check in.
          </Text>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  puInfo: {
    alignItems: 'center',
  },
  puCode: {
    backgroundColor: '#D4AF37',
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  puName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  puLocation: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#222222',
    marginVertical: 24,
  },
  locationInfo: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  accuracyText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#999999',
    marginRight: 8,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceSuccess: {
    color: '#00FF00',
  },
  distanceError: {
    color: '#FF0000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  statusError: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statusSuccessText: {
    color: '#00FF00',
  },
  statusErrorText: {
    color: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
  },
  checkInButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  checkInButtonDisabled: {
    opacity: 0.5,
  },
  checkInText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  warningText: {
    color: '#FF6666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CheckInScreen;
