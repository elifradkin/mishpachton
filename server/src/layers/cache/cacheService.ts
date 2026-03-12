/**
 * Layer B — Local Cache Layer
 * 
 * Responsible for managing the local file cache that serves as
 * the runtime read model for the application.
 * 
 * CACHE STRUCTURE:
 *   /cache/
 *     active/          → Current working dataset (JSON files)
 *     staging/         → Incoming sync data (validated before promotion)
 *     snapshots/       → Last-known-good backup(s)
 *     metadata.json    → Version, timestamps, file inventory
 *     sync-log.json    → Sync operation history
 * 
 * CACHE BEHAVIOR:
 * - If new sync is valid → promote staging to active, archive old active
 * - If new sync is invalid → keep current active, log error
 * - If no active cache + sync fails → show onboarding/error state
 * - If active cache + sync fails → continue using it, show stale notice
 * 
 * IMPLEMENTATION NOTES:
 * - In browser-only mode, uses localStorage or IndexedDB
 * - In Electron/Node mode, uses filesystem with atomic writes
 * - Atomic replacement ensures no partial state
 */

import type { CacheMetadata } from '../../types/domain';
import { safeJsonParse } from '../../utils';

// --- Cache Configuration ---
export interface CacheConfig {
  /** Base path for cache storage */
  basePath: string;
  /** Maximum number of snapshots to retain */
  maxSnapshots: number;
  /** Maximum age of cache before considered stale (milliseconds) */
  staleThresholdMs: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  basePath: '/cache',
  maxSnapshots: 3,
  staleThresholdMs: 6 * 60 * 60 * 1000, // 6 hours
};

// --- Cache Service Interface ---
export interface CacheService {
  /** Initialize cache, load metadata */
  initialize(): Promise<void>;

  /** Check if active cache exists */
  hasActiveCache(): boolean;

  /** Check if cache is stale (older than threshold) */
  isStale(): boolean;

  /** Read a file from active cache */
  readFile<T>(relativePath: string, fallback: T): T;

  /** Write files to staging area */
  writeToStaging(files: Record<string, unknown>): Promise<void>;

  /** Validate all files in staging */
  validateStaging(): Promise<{ valid: string[]; invalid: string[] }>;

  /** Promote staging to active cache */
  promoteStaging(): Promise<boolean>;

  /** Create a snapshot of current active cache */
  createSnapshot(): Promise<void>;

  /** Restore from last known good snapshot */
  restoreFromSnapshot(): Promise<boolean>;

  /** Get cache metadata */
  getMetadata(): CacheMetadata | null;

  /** Clear all cache data */
  clearCache(): Promise<void>;
}

/**
 * In-Memory Cache Service
 * 
 * Used in browser-only mode. Stores cache data in memory.
 * In production, this would be replaced with IndexedDB or filesystem implementation.
 */
export class InMemoryCacheService implements CacheService {
  private config: CacheConfig;
  private activeCache: Map<string, unknown> = new Map();
  private stagingCache: Map<string, unknown> = new Map();
  private snapshots: Map<string, unknown>[] = [];
  private metadata: CacheMetadata | null = null;
  private initialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    // In production: read metadata.json from disk
    // For now: mark as initialized
    this.initialized = true;
    console.log('[Cache] Initialized in-memory cache');
  }

  hasActiveCache(): boolean {
    return this.activeCache.size > 0;
  }

  isStale(): boolean {
    if (!this.metadata?.lastUpdated) return true;
    const age = Date.now() - new Date(this.metadata.lastUpdated).getTime();
    return age > this.config.staleThresholdMs;
  }

  readFile<T>(relativePath: string, fallback: T): T {
    const data = this.activeCache.get(relativePath);
    if (data === undefined) return fallback;
    return data as T;
  }

  async writeToStaging(files: Record<string, unknown>): Promise<void> {
    this.stagingCache.clear();
    for (const [path, content] of Object.entries(files)) {
      this.stagingCache.set(path, content);
    }
    console.log(`[Cache] Wrote ${Object.keys(files).length} files to staging`);
  }

  async validateStaging(): Promise<{ valid: string[]; invalid: string[] }> {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const [path, content] of this.stagingCache.entries()) {
      try {
        // Check if content is valid (not null, not undefined)
        if (content != null) {
          // If string, try JSON parse
          if (typeof content === 'string') {
            JSON.parse(content);
          }
          valid.push(path);
        } else {
          invalid.push(path);
        }
      } catch {
        invalid.push(path);
      }
    }

    return { valid, invalid };
  }

  async promoteStaging(): Promise<boolean> {
    if (this.stagingCache.size === 0) {
      console.warn('[Cache] No staging data to promote');
      return false;
    }

    // Create snapshot of current active
    if (this.activeCache.size > 0) {
      await this.createSnapshot();
    }

    // Atomic swap: staging → active
    this.activeCache = new Map(this.stagingCache);
    this.stagingCache.clear();

    // Update metadata
    this.metadata = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      fileCount: this.activeCache.size,
      totalSizeBytes: 0, // Would calculate in production
      files: {},
    };

    for (const [path] of this.activeCache.entries()) {
      this.metadata.files[path] = {
        lastModified: new Date().toISOString(),
        sizeBytes: 0,
      };
    }

    console.log(`[Cache] Promoted ${this.activeCache.size} files from staging to active`);
    return true;
  }

  async createSnapshot(): Promise<void> {
    const snapshot = new Map(this.activeCache);
    this.snapshots.unshift(snapshot);

    // Trim old snapshots
    while (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.pop();
    }

    console.log(`[Cache] Created snapshot (${this.snapshots.length} total)`);
  }

  async restoreFromSnapshot(): Promise<boolean> {
    if (this.snapshots.length === 0) {
      console.warn('[Cache] No snapshots available to restore');
      return false;
    }

    this.activeCache = new Map(this.snapshots[0]);
    console.log('[Cache] Restored from last known good snapshot');
    return true;
  }

  getMetadata(): CacheMetadata | null {
    return this.metadata;
  }

  async clearCache(): Promise<void> {
    this.activeCache.clear();
    this.stagingCache.clear();
    this.snapshots = [];
    this.metadata = null;
    console.log('[Cache] Cache cleared');
  }
}

// Singleton
export const cacheService = new InMemoryCacheService();
