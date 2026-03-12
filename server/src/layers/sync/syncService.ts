/**
 * Layer A — Sync Layer
 * 
 * Responsible for SSH/SFTP connectivity to the remote server,
 * file discovery, selective download, validation, and cache update.
 * 
 * IMPLEMENTATION NOTES:
 * - In production, this runs as a Node.js backend service or Electron main process
 * - Uses ssh2/ssh2-sftp-client for SFTP operations
 * - The browser frontend communicates with it via API or IPC
 * - Never expose SSH credentials to the browser
 * 
 * WORKFLOW:
 * 1. Connect to remote server via SSH/SFTP
 * 2. List remote files with modification times
 * 3. Compare with local cache metadata
 * 4. Download only changed files to staging area
 * 5. Validate downloaded JSON files
 * 6. On success: atomically promote staging → active cache
 * 7. On failure: keep current active cache, log error
 * 8. Preserve last-known-good snapshot
 */

import type { SyncConfig, SyncState, SyncLogEntry, CacheMetadata } from '../../types/domain';

// --- Sync Configuration ---
export function loadSyncConfig(): SyncConfig {
  return {
    host: import.meta.env.VITE_SYNC_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_SYNC_PORT || '22', 10),
    username: import.meta.env.VITE_SYNC_USERNAME || 'family-sync',
    remotePath: import.meta.env.VITE_SYNC_REMOTE_PATH || '/data',
    autoSyncOnStartup: import.meta.env.VITE_SYNC_AUTO_ON_STARTUP === 'true',
    syncIntervalMinutes: parseInt(import.meta.env.VITE_SYNC_INTERVAL_MINUTES || '30', 10),
  };
}

// --- Remote File Manifest ---
export interface RemoteFileInfo {
  path: string;
  size: number;
  modifiedTime: string;
  checksum?: string;
}

/**
 * Expected remote directory structure:
 * /data/
 *   normalized/   → persons.json, events.json, feedings.json, sleeps.json, etc.
 *   derived/      → dashboard_today.json, charts_*.json, alerts_open.json, etc.
 *   indexes/      → by_date.json, by_person.json, latest_state.json
 *   schemas/      → field_dictionary.json, i18n_dictionary.json
 */
export const REMOTE_DIRECTORIES = [
  'normalized',
  'derived',
  'indexes',
  'schemas',
] as const;

export const EXPECTED_FILES = {
  normalized: [
    'persons.json',
    'events.json',
    'feedings.json',
    'sleeps.json',
    'diapers.json',
    'health_logs.json',
    'medications.json',
    'appointments.json',
    'tasks.json',
    'reminders.json',
  ],
  derived: [
    'dashboard_today.json',
    'dashboard_this_week.json',
    'baby_daily_metrics.json',
    'mother_recovery_metrics.json',
    'family_task_metrics.json',
    'alerts_open.json',
    'timeline_flat.json',
    'charts_feeding_daily.json',
    'charts_sleep_daily.json',
    'charts_diapers_daily.json',
  ],
  indexes: [
    'by_date.json',
    'by_person.json',
    'latest_state.json',
    'search_index.json',
  ],
  schemas: [
    'field_dictionary.json',
    'i18n_dictionary.json',
  ],
} as const;

// --- Sync Service Interface ---
export interface SyncService {
  /**
   * Perform a full sync operation.
   * Returns updated sync state.
   */
  performSync(): Promise<SyncState>;

  /**
   * List files on remote server.
   */
  listRemoteFiles(): Promise<RemoteFileInfo[]>;

  /**
   * Download specific files to staging area.
   */
  downloadFiles(files: string[]): Promise<{ downloaded: string[]; failed: string[] }>;

  /**
   * Validate downloaded files (JSON parse check).
   */
  validateStagingFiles(): Promise<{ valid: string[]; invalid: string[] }>;

  /**
   * Promote staging to active cache.
   */
  promoteStagingToActive(): Promise<boolean>;

  /**
   * Get sync log entries.
   */
  getSyncLog(): SyncLogEntry[];

  /**
   * Get current sync state.
   */
  getState(): SyncState;
}

/**
 * Mock Sync Service — used in browser-only mode.
 * In production, replace with real SSH/SFTP implementation.
 */
export class MockSyncService implements SyncService {
  private state: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    lastSuccessTime: null,
    lastError: null,
    filesUpdated: 0,
    isAutoSyncEnabled: true,
  };

  private log: SyncLogEntry[] = [];

  async performSync(): Promise<SyncState> {
    this.state.status = 'syncing';
    this.addLog('sync_start', 'success', 'התחלת סנכרון...');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Simulate success/failure
    const success = Math.random() > 0.15;

    if (success) {
      const filesUpdated = Math.floor(Math.random() * 15) + 3;
      this.state = {
        ...this.state,
        status: 'success',
        lastSyncTime: new Date().toISOString(),
        lastSuccessTime: new Date().toISOString(),
        lastError: null,
        filesUpdated,
      };
      this.addLog('sync_complete', 'success', `סנכרון מלא הושלם — ${filesUpdated} קבצים עודכנו`);
    } else {
      this.state = {
        ...this.state,
        status: 'error',
        lastSyncTime: new Date().toISOString(),
        lastError: 'שגיאת חיבור לשרת — connection timeout',
      };
      this.addLog('sync_error', 'error', 'שגיאת חיבור לשרת — timeout');
    }

    return this.state;
  }

  async listRemoteFiles(): Promise<RemoteFileInfo[]> {
    // Mock: return expected file list
    return Object.entries(EXPECTED_FILES).flatMap(([dir, files]) =>
      files.map((file) => ({
        path: `${dir}/${file}`,
        size: Math.floor(Math.random() * 50000) + 1000,
        modifiedTime: new Date().toISOString(),
      }))
    );
  }

  async downloadFiles(files: string[]): Promise<{ downloaded: string[]; failed: string[] }> {
    return { downloaded: files, failed: [] };
  }

  async validateStagingFiles(): Promise<{ valid: string[]; invalid: string[] }> {
    return { valid: [], invalid: [] };
  }

  async promoteStagingToActive(): Promise<boolean> {
    return true;
  }

  getSyncLog(): SyncLogEntry[] {
    return this.log;
  }

  getState(): SyncState {
    return this.state;
  }

  private addLog(action: string, status: 'success' | 'error' | 'warning', message: string): void {
    this.log.unshift({
      timestamp: new Date().toISOString(),
      action,
      status,
      message,
    });
    // Keep last 100 entries
    if (this.log.length > 100) this.log.pop();
  }
}

// Singleton
export const syncService = new MockSyncService();
