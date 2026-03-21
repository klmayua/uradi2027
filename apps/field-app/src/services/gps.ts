import * as Location from 'expo-location';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
}

export interface DeviceInfo {
  fingerprint: string;
  model: string;
  brand: string;
  osVersion: string;
  appVersion: string;
  platform: string;
}

// Request location permissions
export const requestLocationPermission = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === 'granted';
};

// Get current location with high accuracy
export const getCurrentLocation = async (
  options: {
    accuracy?: Location.Accuracy;
    maximumAge?: number;
    timeout?: number;
  } = {}
): Promise<GPSLocation> => {
  const {
    accuracy = Location.Accuracy.BestForNavigation,
    maximumAge = 0,
    timeout = 30000,
  } = options;

  const location = await Location.getCurrentPositionAsync({
    accuracy,
    maximumAge,
    mayShowUserSettingsDialog: true,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy || 100,
    altitude: location.coords.altitude || null,
    timestamp: location.timestamp,
  };
};

// Watch location updates
export const watchLocation = async (
  callback: (location: GPSLocation) => void,
  options: {
    accuracy?: Location.Accuracy;
    distanceInterval?: number;
    timeInterval?: number;
  } = {}
): Promise<{ remove: () => void }> => {
  const {
    accuracy = Location.Accuracy.BestForNavigation,
    distanceInterval = 10, // meters
    timeInterval = 5000, // milliseconds
  } = options;

  const subscription = await Location.watchPositionAsync(
    {
      accuracy,
      distanceInterval,
      timeInterval,
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 100,
        altitude: location.coords.altitude || null,
        timestamp: location.timestamp,
      });
    }
  );

  return subscription;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if location is within polling unit radius
export const isWithinPollingUnit = (
  userLocation: GPSLocation,
  puLatitude: number,
  puLongitude: number,
  radiusMeters: number = 100
): { isWithin: boolean; distance: number }> => {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    puLatitude,
    puLongitude
  );

  return {
    isWithin: distance <= radiusMeters,
    distance,
  };
};

// Get device fingerprint
export const getDeviceFingerprint = async (): Promise<string> => {
  const deviceId = await Application.getInstallationTimeAsync();
  const brand = Device.brand || 'unknown';
  const model = Device.modelName || 'unknown';
  const osVersion = Device.osVersion || 'unknown';

  // Create a unique fingerprint
  const fingerprint = `${brand}-${model}-${osVersion}-${deviceId}`;

  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString(16);
};

// Get full device info
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const [fingerprint, nativeVersion] = await Promise.all([
    getDeviceFingerprint(),
    Application.nativeApplicationVersion || '1.0.0',
  ]);

  return {
    fingerprint,
    model: Device.modelName || 'Unknown',
    brand: Device.brand || 'Unknown',
    osVersion: Device.osVersion || 'Unknown',
    appVersion: nativeVersion,
    platform: Platform.OS,
  };
};

// Get NTP-synchronized timestamp (fallback to device time)
export const getNTPTimestamp = async (): Promise<number> => {
  try {
    // Try to get from API (more accurate)
    // In production, you'd use a library like react-native-ntp-client
    // For now, return device time with API offset if available
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    return new Date(data.datetime).getTime();
  } catch {
    // Fallback to device time
    return Date.now();
  }
};

// Validate GPS accuracy
export const isAccuracyValid = (accuracy: number, minAccuracy: number = 10): boolean => {
  return accuracy <= minAccuracy;
};

// Format coordinates for display
export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
};

// Reverse geocode (get address from coordinates)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<Location.ReverseGeocodeLocation | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return results[0] || null;
  } catch {
    return null;
  }
};

// Check if location services are enabled
export const isLocationEnabled = async (): Promise<boolean> => {
  const enabled = await Location.hasServicesEnabledAsync();
  return enabled;
};

// Get location permission status
export const getLocationPermissionStatus = async (): Promise<
  'granted' | 'denied' | 'undetermined'
> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status;
};
