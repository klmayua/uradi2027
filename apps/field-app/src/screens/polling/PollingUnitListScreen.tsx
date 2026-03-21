import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { getDatabase } from '@database';
import { getCurrentLocation, calculateDistance } from '@services/gps';
import useAuthStore from '@stores/authStore';
import useSyncStore from '@stores/syncStore';
import SyncStatus from '@components/Sync/SyncStatus';

interface PollingUnit {
  id: string;
  puCode: string;
  puName: string;
  lgaName: string;
  wardName: string;
  latitude: number;
  longitude: number;
  registeredVoters: number;
  status: string;
}

const PollingUnitListScreen: React.FC = () => {
  const [pollingUnits, setPollingUnits] = useState<PollingUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filter, setFilter] = useState<'all' | 'nearby' | 'assigned'>('nearby');

  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { isOnline } = useSyncStore();

  const loadPollingUnits = async () => {
    try {
      const db = getDatabase();
      const records = await db.get('polling_units').query().fetch();

      // Get user location
      let location = userLocation;
      if (!location) {
        try {
          const loc = await getCurrentLocation();
          location = { lat: loc.latitude, lng: loc.longitude };
          setUserLocation(location);
        } catch {
          // Location permission denied
        }
      }

      // Calculate distances and sort
      const unitsWithDistance = records.map((record: any) => ({
        id: record.id,
        puCode: record.puCode,
        puName: record.puName,
        lgaName: record.lgaName,
        wardName: record.wardName,
        latitude: record.latitude,
        longitude: record.longitude,
        registeredVoters: record.registeredVoters,
        status: record.status,
        distance: location
          ? calculateDistance(location.lat, location.lng, record.latitude, record.longitude)
          : Infinity,
      }));

      // Sort by distance
      unitsWithDistance.sort((a: any, b: any) => a.distance - b.distance);

      setPollingUnits(unitsWithDistance);
    } catch (error) {
      console.error('Error loading polling units:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPollingUnits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPollingUnits();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPollingUnits();
  };

  const filteredUnits = pollingUnits.filter((pu) => {
    if (filter === 'nearby' && userLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        pu.latitude,
        pu.longitude
      );
      return dist <= 2000; // Within 2km
    }
    if (filter === 'assigned') {
      return pu.lgaName === user?.assigned_lga;
    }
    return true;
  });

  const renderItem = ({ item }: { item: PollingUnit }) => {
    const distance = userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PollingUnitDetail', { puId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.puCode}</Text>
          </View>
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#D4AF37" />
              <Text style={styles.distanceText}>{Math.round(distance)}m</Text>
            </View>
          )}
        </View>

        <Text style={styles.puName}>{item.puName}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666666" />
          <Text style={styles.locationText}>{item.wardName}, {item.lgaName}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.voterCount}>
            <Ionicons name="people-outline" size={14} color="#666666" />
            <Text style={styles.voterText}>{item.registeredVoters.toLocaleString()} voters</Text>
          </View>

          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => navigation.navigate('CheckIn', { puId: item.id })}
          >
            <Text style={styles.checkInText}>Check In</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading polling units...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Polling Units</Text>
          <Text style={styles.subtitle}>
            {filteredUnits.length} units • {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter(filter === 'nearby' ? 'all' : 'nearby')}
        >
          <Ionicons
            name={filter === 'nearby' ? 'locate' : 'locate-outline'}
            size={24}
            color="#D4AF37"
          />
        </TouchableOpacity>
      </View>

      <SyncStatus />

      <FlatList
        data={filteredUnits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#333333" />
            <Text style={styles.emptyText}>No polling units found</Text>
            <Text style={styles.emptySubtext}>Try refreshing or changing filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#999999',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  filterButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    color: '#D4AF37',
    fontSize: 12,
    marginLeft: 4,
  },
  puName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 12,
  },
  voterCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  checkInButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkInText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
});

export default PollingUnitListScreen;
