/**
 * Data Export API Client
 * Handles export requests, downloads, and scheduled backups
 */

import { apiClient } from './client';

export interface ExportRequest {
  export_type: 'voters' | 'mentions' | 'sentiment' | 'narratives' | 'full';
  format: 'csv' | 'json';
  filters?: Record<string, any>;
  date_from?: string;
  date_to?: string;
  include_pii: boolean;
}

export interface ExportJob {
  id: string;
  export_type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_url?: string;
  file_size?: number;
  record_count?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface ScheduledBackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  export_types: string[];
  include_pii: boolean;
  retention_days: number;
  enabled: boolean;
}

export interface ExportStats {
  total_exports: number;
  exports_this_month: number;
  storage_used_bytes: number;
  last_export_date?: string;
  scheduled_backups_enabled: boolean;
}

export interface DataDeletionRequest {
  entity_type: 'voter' | 'contact' | 'user';
  entity_id: string;
  reason: string;
  confirmation_token: string;
}

export const exportsApi = {
  /**
   * Request a new data export
   */
  async requestExport(request: ExportRequest): Promise<ExportJob> {
    const response = await apiClient.post('/exports/request', request);
    return response.data;
  },

  /**
   * Get export statistics
   */
  async getStats(): Promise<ExportStats> {
    const response = await apiClient.get('/exports/stats');
    return response.data;
  },

  /**
   * Download a completed export
   */
  downloadExport(exportId: string): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const url = `${apiClient.defaults.baseURL}/exports/download/${exportId}`;

    // Create a temporary link with auth header
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `uradi360_export_${exportId}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      });
  },

  /**
   * Configure scheduled backups
   */
  async configureScheduledBackup(config: ScheduledBackupConfig): Promise<{ message: string; next_backup: string }> {
    const response = await apiClient.post('/exports/scheduled-backup', config);
    return response.data;
  },

  /**
   * Request GDPR-compliant data deletion
   */
  async requestDataDeletion(request: DataDeletionRequest): Promise<{
    message: string;
    deletion_id: string;
    status: string;
    scheduled_deletion: string;
  }> {
    const response = await apiClient.post('/exports/gdpr/delete', request);
    return response.data;
  },

  /**
   * Export personal data (GDPR data portability)
   */
  async exportPersonalData(): Promise<Record<string, any>> {
    const response = await apiClient.get('/exports/gdpr/export-my-data');
    return response.data;
  },
};
