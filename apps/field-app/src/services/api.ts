import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AppSettings, getDatabase } from '@database';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.uradi360.io';
const API_VERSION = '/api/v1';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await SecureStore.getItemAsync('auth_token');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Add device info
        config.headers['X-Device-Platform'] = Platform.OS;
        config.headers['X-App-Version'] = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, clear and logout
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(phone: string, otp: string): Promise<{ token: string; user: any }> {
    const response = await this.client.post('/field/auth/login', { phone, otp });
    this.token = response.data.access_token;
    await SecureStore.setItemAsync('auth_token', this.token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
    return { token: this.token, user: response.data.user };
  }

  async logout(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
  }

  async getStoredAuth(): Promise<{ token: string | null; user: any | null }> {
    const [token, userData] = await Promise.all([
      SecureStore.getItemAsync('auth_token'),
      SecureStore.getItemAsync('user_data'),
    ]);
    return {
      token,
      user: userData ? JSON.parse(userData) : null,
    };
  }

  // Polling Units
  async fetchPollingUnits(stateCode: string, lastSync?: number): Promise<any[]> {
    const params: any = { state_code: stateCode };
    if (lastSync) {
      params.last_sync = lastSync;
    }
    const response = await this.client.get('/mobile/sync/polling-units', { params });
    return response.data;
  }

  async getNearbyPollingUnits(lat: number, lng: number, radius: number = 500): Promise<any[]> {
    const response = await this.client.get('/polling-units/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  }

  // Evidence
  async uploadEvidence(evidence: FormData): Promise<any> {
    const response = await this.client.post('/mobile/evidence/upload', evidence, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for image upload
    });
    return response.data;
  }

  async verifyEvidence(txHash: string): Promise<any> {
    const response = await this.client.get(`/mobile/evidence/verify/${txHash}`);
    return response.data;
  }

  // Accreditation
  async submitAccreditation(data: {
    polling_unit_id: string;
    time_slot: string;
    accredited_count: number;
    bvas_functional: boolean;
    queue_length: string;
    issues?: string[];
    evidence_id?: string;
  }): Promise<any> {
    const response = await this.client.post('/election-day/accreditation', data);
    return response.data;
  }

  // Vote Tally
  async submitVoteTally(data: {
    polling_unit_id: string;
    candidate_name: string;
    party: string;
    votes_received: number;
    is_incumbent: boolean;
    evidence_id?: string;
  }): Promise<any> {
    const response = await this.client.post('/election-day/vote-tally', data);
    return response.data;
  }

  // Incidents
  async reportIncident(data: {
    polling_unit_id: string;
    incident_type: string;
    severity: string;
    description: string;
    latitude?: number;
    longitude?: number;
    evidence_ids?: string[];
  }): Promise<any> {
    const response = await this.client.post('/election-day/incident', data);
    return response.data;
  }

  // Monitor Check-in
  async checkIn(pollingUnitId: string, latitude: number, longitude: number, notes?: string): Promise<any> {
    const response = await this.client.post('/election-day/monitor/check-in', {
      polling_unit_id: pollingUnitId,
      latitude,
      longitude,
      notes,
    });
    return response.data;
  }

  // Sync
  async syncPull(lastPulledAt: number | null, tables: string[]): Promise<any> {
    const response = await this.client.post('/sync/pull', {
      last_pulled_at: lastPulledAt,
      tables,
    });
    return response.data;
  }

  async syncPush(changes: any, lastPulledAt: number): Promise<any> {
    const response = await this.client.post('/sync/push', {
      changes,
      last_pulled_at: lastPulledAt,
    });
    return response.data;
  }

  async syncCompressed(data: string): Promise<any> {
    const response = await this.client.post('/sync/compressed', {
      compressed_data: data,
      encoding: 'gzip+base64',
    });
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Generic request methods
  async get(url: string, config?: any): Promise<any> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: any): Promise<any> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
