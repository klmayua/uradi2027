import {
  Model,
  field,
  date,
  relation,
  children,
  lazy,
} from '@nozbe/watermelondb/decorators';
import { Q } from '@nozbe/watermelondb';

// Base Model with common fields
export abstract class BaseModel extends Model {
  @field('remote_id') remoteId!: string | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('sync_status') syncStatus!: 'synced' | 'pending' | 'error';
  @field('sync_error') syncError!: string | null;
}

// Polling Unit Model
export class PollingUnit extends BaseModel {
  static table = 'polling_units';

  @field('pu_code') puCode!: string;
  @field('pu_name') puName!: string;
  @field('lga_id') lgaId!: string;
  @field('lga_name') lgaName!: string;
  @field('ward_id') wardId!: string;
  @field('ward_name') wardName!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @field('registered_voters') registeredVoters!: number;
  @field('status') status!: 'active' | 'closed' | 'suspended';
  @field('downloaded') downloaded!: boolean;

  @children('evidence') evidence!: any[];
  @children('accreditation_records') accreditationRecords!: any[];
  @children('vote_tallies') voteTallies!: any[];
  @children('incidents') incidents!: any[];
}

// User Model
export class User extends BaseModel {
  static table = 'users';

  @field('email') email!: string;
  @field('full_name') fullName!: string;
  @field('phone') phone!: string;
  @field('role') role!: 'field_agent' | 'coordinator' | 'monitor';
  @field('assigned_lga') assignedLga!: string | null;
  @field('token') token!: string;
  @field('refresh_token') refreshToken!: string;
  @field('is_active') isActive!: boolean;
  @date('last_login') lastLogin!: Date;
}

// Evidence Model - Blockchain Anchored
export class Evidence extends BaseModel {
  static table = 'evidence';

  // Relations
  @field('polling_unit_id') pollingUnitId!: string;
  @field('monitor_id') monitorId!: string;

  // Evidence Type
  @field('evidence_type') evidenceType!: 'accreditation' | 'voting' | 'counting' | 'result' | 'incident';

  // Image Data
  @field('local_uri') localUri!: string;
  @field('remote_uri') remoteUri!: string | null;
  @field('image_hash') imageHash!: string;

  // GPS Forensics
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @field('gps_accuracy') gpsAccuracy!: number;
  @field('altitude') altitude!: number | null;

  // Temporal Forensics
  @date('captured_at') capturedAt!: Date;
  @field('ntp_timestamp') ntpTimestamp!: string | null;

  // Device Forensics
  @field('device_fingerprint') deviceFingerprint!: string;
  @field('device_model') deviceModel!: string;
  @field('os_version') osVersion!: string;
  @field('app_version') appVersion!: string;

  // Blockchain Anchoring
  @field('ipfs_hash') ipfsHash!: string | null;
  @field('blockchain_tx') blockchainTx!: string | null;
  @date('anchored_at') anchoredAt!: Date | null;

  // Verification Status
  @field('forensic_status') forensicStatus!: 'pending' | 'verified' | 'rejected';
  @field('forensic_details') forensicDetails!: string | null; // JSON

  // Offline Queue
  @field('upload_queue_position') uploadQueuePosition!: number;
  @field('retry_count') retryCount!: number;
  @field('last_retry') lastRetry!: Date | null;

  @relation('polling_units', 'polling_unit_id') pollingUnit!: PollingUnit;
}

// Accreditation Record
export class AccreditationRecord extends BaseModel {
  static table = 'accreditation_records';

  @field('polling_unit_id') pollingUnitId!: string;
  @field('monitor_id') monitorId!: string;

  @field('time_slot') timeSlot!: string; // '08:00', '10:00', etc.
  @field('accredited_count') accreditedCount!: number;
  @field('bvas_functional') bvasFunctional!: boolean;
  @field('queue_length') queueLength!: 'short' | 'medium' | 'long';
  @field('issues') issues!: string; // JSON array

  @field('evidence_id') evidenceId!: string | null; // Photo evidence

  @relation('polling_units', 'polling_unit_id') pollingUnit!: PollingUnit;
}

// Vote Tally (PVT)
export class VoteTally extends BaseModel {
  static table = 'vote_tallies';

  @field('polling_unit_id') pollingUnitId!: string;
  @field('monitor_id') monitorId!: string;

  @field('candidate_name') candidateName!: string;
  @field('party') party!: string;
  @field('votes_received') votesReceived!: number;
  @field('is_incumbent') isIncumbent!: boolean;

  @field('evidence_id') evidenceId!: string | null; // Photo of result sheet
  @field('verified') verified!: boolean;

  @relation('polling_units', 'polling_unit_id') pollingUnit!: PollingUnit;
}

// Election Day Incident
export class ElectionDayIncident extends BaseModel {
  static table = 'election_day_incidents';

  @field('polling_unit_id') pollingUnitId!: string;
  @field('monitor_id') monitorId!: string;

  @field('incident_type') incidentType!:
    | 'violence'
    | 'ballot_snatching'
    | 'bribery'
    | 'accreditation_issue'
    | 'materials_shortage'
    | 'vote_buying'
    | 'other';

  @field('severity') severity!: 'low' | 'medium' | 'high' | 'critical';
  @field('description') description!: string;

  @field('latitude') latitude!: number | null;
  @field('longitude') longitude!: number | null;

  @field('evidence_ids') evidenceIds!: string; // JSON array of evidence IDs

  @field('status') status!: 'reported' | 'acknowledged' | 'resolved' | 'escalated';
  @field('resolution_notes') resolutionNotes!: string | null;

  @relation('polling_units', 'polling_unit_id') pollingUnit!: PollingUnit;
}

// Sync Queue
export class SyncQueue extends Model {
  static table = 'sync_queue';

  @field('table_name') tableName!: string;
  @field('record_id') recordId!: string;
  @field('operation') operation!: 'create' | 'update' | 'delete';
  @field('payload') payload!: string; // JSON
  @field('priority') priority!: number;
  @field('retry_count') retryCount!: number;
  @date('created_at') createdAt!: Date;
  @date('last_attempt') lastAttempt!: Date | null;
  @field('error_message') errorMessage!: string | null;
}

// Settings / Configuration
export class AppSettings extends Model {
  static table = 'app_settings';

  @field('key') key!: string;
  @field('value') value!: string;
  @date('updated_at') updatedAt!: Date;

  static async getSetting(database: any, key: string): Promise<string | null> {
    const settings = await database.get('app_settings').query(
      Q.where('key', key)
    ).fetch();
    return settings[0]?.value || null;
  }

  static async setSetting(database: any, key: string, value: string): Promise<void> {
    const settingsCollection = database.get('app_settings');
    const existing = await settingsCollection.query(Q.where('key', key)).fetch();

    await database.write(async () => {
      if (existing[0]) {
        await existing[0].update((record: any) => {
          record.value = value;
          record.updatedAt = new Date();
        });
      } else {
        await settingsCollection.create((record: any) => {
          record.key = key;
          record.value = value;
          record.updatedAt = new Date();
        });
      }
    });
  }
}

// Schema definition
export const schema = {
  version: 1,
  tables: [
    {
      name: 'polling_units',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'pu_code', type: 'string' },
        { name: 'pu_name', type: 'string' },
        { name: 'lga_id', type: 'string' },
        { name: 'lga_name', type: 'string' },
        { name: 'ward_id', type: 'string' },
        { name: 'ward_name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'registered_voters', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'downloaded', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'users',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'email', type: 'string' },
        { name: 'full_name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'assigned_lga', type: 'string', isOptional: true },
        { name: 'token', type: 'string' },
        { name: 'refresh_token', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'last_login', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'evidence',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'polling_unit_id', type: 'string' },
        { name: 'monitor_id', type: 'string' },
        { name: 'evidence_type', type: 'string' },
        { name: 'local_uri', type: 'string' },
        { name: 'remote_uri', type: 'string', isOptional: true },
        { name: 'image_hash', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'gps_accuracy', type: 'number' },
        { name: 'altitude', type: 'number', isOptional: true },
        { name: 'captured_at', type: 'number' },
        { name: 'ntp_timestamp', type: 'string', isOptional: true },
        { name: 'device_fingerprint', type: 'string' },
        { name: 'device_model', type: 'string' },
        { name: 'os_version', type: 'string' },
        { name: 'app_version', type: 'string' },
        { name: 'ipfs_hash', type: 'string', isOptional: true },
        { name: 'blockchain_tx', type: 'string', isOptional: true },
        { name: 'anchored_at', type: 'number', isOptional: true },
        { name: 'forensic_status', type: 'string' },
        { name: 'forensic_details', type: 'string', isOptional: true },
        { name: 'upload_queue_position', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'last_retry', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'accreditation_records',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'polling_unit_id', type: 'string' },
        { name: 'monitor_id', type: 'string' },
        { name: 'time_slot', type: 'string' },
        { name: 'accredited_count', type: 'number' },
        { name: 'bvas_functional', type: 'boolean' },
        { name: 'queue_length', type: 'string' },
        { name: 'issues', type: 'string' },
        { name: 'evidence_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'vote_tallies',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'polling_unit_id', type: 'string' },
        { name: 'monitor_id', type: 'string' },
        { name: 'candidate_name', type: 'string' },
        { name: 'party', type: 'string' },
        { name: 'votes_received', type: 'number' },
        { name: 'is_incumbent', type: 'boolean' },
        { name: 'evidence_id', type: 'string', isOptional: true },
        { name: 'verified', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'election_day_incidents',
      columns: [
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'polling_unit_id', type: 'string' },
        { name: 'monitor_id', type: 'string' },
        { name: 'incident_type', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'evidence_ids', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'resolution_notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'sync_queue',
      columns: [
        { name: 'table_name', type: 'string' },
        { name: 'record_id', type: 'string' },
        { name: 'operation', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'priority', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'last_attempt', type: 'number', isOptional: true },
        { name: 'error_message', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'app_settings',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    },
  ],
};

export const tableNames = [
  'polling_units',
  'users',
  'evidence',
  'accreditation_records',
  'vote_tallies',
  'election_day_incidents',
  'sync_queue',
  'app_settings',
] as const;
