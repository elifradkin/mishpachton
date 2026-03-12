/**
 * API Client — connects the frontend to the sync backend server.
 * 
 * The backend runs at localhost:3456 and serves the real data
 * from the Hetzner server via SFTP.
 */

const API_BASE = 'http://localhost:3456/api';

export interface SyncStatusResponse {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | null;
  lastSuccessTime: string | null;
  lastError: string | null;
  filesUpdated: number;
  filesTotal: number;
}

export interface AllDataResponse {
  [key: string]: unknown;
  _syncState: SyncStatusResponse;
  _cachedAt: string;
}

/**
 * Fetch all cached data in one request (initial load).
 */
export async function fetchAllData(): Promise<AllDataResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to fetch all data:', err);
    return null;
  }
}

/**
 * Fetch a specific data file from the cache.
 */
export async function fetchDataFile<T>(filePath: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/data/${filePath}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[API] Failed to fetch ${filePath}:`, err);
    return null;
  }
}

/**
 * Get current sync status.
 */
export async function fetchSyncStatus(): Promise<SyncStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/sync/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to fetch sync status:', err);
    return null;
  }
}

/**
 * Trigger a manual sync.
 */
export async function triggerSync(): Promise<SyncStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/sync/trigger`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to trigger sync:', err);
    return null;
  }
}

/**
 * Fetch sync log.
 */
export async function fetchSyncLog(): Promise<unknown[]> {
  try {
    const res = await fetch(`${API_BASE}/sync/log`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to fetch sync log:', err);
    return [];
  }
}

/**
 * Check if backend is running.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
