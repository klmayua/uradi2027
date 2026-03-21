import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';

/**
 * Calculate SHA-256 hash of a file
 */
export const calculateFileHash = async (fileUri: string): Promise<string> => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Calculate SHA-256 hash
    const hash = CryptoJS.SHA256(base64).toString();
    return hash;
  } catch (error) {
    console.error('Error calculating file hash:', error);
    throw error;
  }
};

/**
 * Calculate SHA-256 hash of image
 */
export const calculateImageHash = async (imageUri: string): Promise<string> => {
  return calculateFileHash(imageUri);
};

/**
 * Calculate hash of string
 */
export const calculateStringHash = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Calculate hash of object (JSON)
 */
export const calculateObjectHash = (obj: any): string => {
  const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
  return CryptoJS.SHA256(jsonString).toString();
};

/**
 * Generate device fingerprint
 */
export const generateDeviceFingerprint = (deviceInfo: {
  brand: string;
  model: string;
  osVersion: string;
  appVersion: string;
  uniqueId: string;
}): string => {
  const fingerprint = `${deviceInfo.brand}-${deviceInfo.model}-${deviceInfo.osVersion}-${deviceInfo.appVersion}-${deviceInfo.uniqueId}`;
  return CryptoJS.SHA256(fingerprint).toString().substring(0, 16);
};

/**
 * Verify hash integrity
 */
export const verifyHash = (data: string, expectedHash: string): boolean => {
  const actualHash = CryptoJS.SHA256(data).toString();
  return actualHash === expectedHash;
};

/**
 * Create HMAC signature
 */
export const createHmac = (data: string, secret: string): string => {
  return CryptoJS.HmacSHA256(data, secret).toString();
};

/**
 * Generate random nonce
 */
export const generateNonce = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < length; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
};

/**
 * Encode to Base64
 */
export const toBase64 = (data: string): string => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
};

/**
 * Decode from Base64
 */
export const fromBase64 = (base64: string): string => {
  return CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
};

/**
 * Combine hashes (for multi-part evidence)
 */
export const combineHashes = (hashes: string[]): string => {
  const combined = hashes.sort().join('');
  return CryptoJS.SHA256(combined).toString();
};

/**
 * Hash GPS coordinates for blockchain anchoring
 */
export const hashGPSData = (lat: number, lng: number, accuracy: number): string => {
  const gpsString = `${lat.toFixed(6)},${lng.toFixed(6)},${accuracy.toFixed(1)}`;
  return CryptoJS.SHA256(gpsString).toString();
};
