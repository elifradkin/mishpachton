/**
 * Mishpachton Backend Sync Server
 * 
 * Connects to the Hetzner server via SSH/SFTP, reads the family-manager
 * data files from OpenClaw's workspace, caches them locally, and serves
 * them to the frontend via a simple HTTP API on localhost.
 * 
 * Architecture:
 *   [Hetzner Server] --SFTP--> [This Backend] --HTTP--> [React Frontend]
 * 
 * Data source: /root/.openclaw/workspace-zohar/family-manager/data/
 */

import { Client } from 'ssh2';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuration ───
const CONFIG = {
  ssh: {
    host: process.env.SYNC_HOST || '5.78.70.179',
    port: parseInt(process.env.SYNC_PORT || '22'),
    username: process.env.SYNC_USERNAME || 'root',
    privateKeyPath: process.env.SYNC_KEY_PATH || path.join(process.env.USERPROFILE || process.env.HOME || '', '.ssh', 'id_ed25519'),
  },
  remotePath: '/root/.openclaw/workspace-zohar/family-manager/data',
  cachePath: path.join(__dirname, '..', '.cache'),
  snapshotPath: path.join(__dirname, '..', '.cache', 'snapshots'),
  port: parseInt(process.env.SYNC_API_PORT || '3456'),
  autoSyncIntervalMs: 5 * 60 * 1000, // 5 minutes
};

// ─── Files to sync ───
const SYNC_FILES = [
  // Top-level data files
  'family.json',
  'feeding.json',
  'diapers.json',
  'sleep.json',
  'health.json',
  'recovery.json',
  'tasks.json',
  'appointments.json',
  // Normalized
  'normalized/persons.json',
  'normalized/feedings.json',
  'normalized/diapers.json',
  'normalized/sleeps.json',
  'normalized/events.json',
  'normalized/health_logs.json',
  'normalized/medications.json',
  'normalized/tasks.json',
  'normalized/appointments.json',
  'normalized/reminders.json',
  // Derived
  'derived/dashboard_today.json',
  'derived/alerts_open.json',
  'derived/baby_daily_metrics.json',
  'derived/mother_recovery_metrics.json',
  'derived/family_task_metrics.json',
  'derived/timeline_flat.json',
  // Indexes
  'indexes/by_date.json',
  'indexes/by_person.json',
  'indexes/by_entity_type.json',
  'indexes/latest_state.json',
  // Schemas
  'schemas/field_dictionary.json',
  'schemas/enums.json',
  'schemas/i18n_dictionary.json',
  // Snapshots
  'snapshots/snapshot_2026-03-12.json',
  // Logs
  'logs/operations.json',
  'raw/audit_log.json',
];

// ─── State ───
let syncState = {
  status: 'idle', // idle | syncing | success | error
  lastSyncTime: null,
  lastSuccessTime: null,
  lastError: null,
  filesUpdated: 0,
  filesTotal: SYNC_FILES.length,
};
const syncLog = [];

function log(level, message, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  };
  syncLog.unshift(entry);
  if (syncLog.length > 200) syncLog.pop();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${entry.timestamp}] ${message}`);
}

// ─── Ensure directories ───
function ensureDirs() {
  const dirs = [
    CONFIG.cachePath,
    CONFIG.snapshotPath,
    path.join(CONFIG.cachePath, 'normalized'),
    path.join(CONFIG.cachePath, 'derived'),
    path.join(CONFIG.cachePath, 'indexes'),
    path.join(CONFIG.cachePath, 'schemas'),
    path.join(CONFIG.cachePath, 'snapshots'),
    path.join(CONFIG.cachePath, 'logs'),
    path.join(CONFIG.cachePath, 'raw'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// ─── SFTP Sync ───
function performSync() {
  return new Promise((resolve, reject) => {
    if (syncState.status === 'syncing') {
      log('warn', 'Sync already in progress, skipping');
      return resolve(syncState);
    }

    syncState.status = 'syncing';
    syncState.lastError = null;
    log('info', 'Starting sync...');

    const conn = new Client();
    let privateKey;

    try {
      privateKey = fs.readFileSync(CONFIG.ssh.privateKeyPath);
    } catch (err) {
      const msg = `Cannot read SSH key at ${CONFIG.ssh.privateKeyPath}: ${err.message}`;
      log('error', msg);
      syncState.status = 'error';
      syncState.lastError = msg;
      syncState.lastSyncTime = new Date().toISOString();
      return reject(new Error(msg));
    }

    conn.on('ready', () => {
      log('info', 'SSH connection established');

      conn.sftp((err, sftp) => {
        if (err) {
          log('error', `SFTP session error: ${err.message}`);
          syncState.status = 'error';
          syncState.lastError = err.message;
          syncState.lastSyncTime = new Date().toISOString();
          conn.end();
          return reject(err);
        }

        log('info', 'SFTP session opened, downloading files...');

        let downloaded = 0;
        let failed = 0;
        let completed = 0;

        const checkDone = () => {
          completed++;
          if (completed >= SYNC_FILES.length) {
            syncState.status = failed === SYNC_FILES.length ? 'error' : 'success';
            syncState.lastSyncTime = new Date().toISOString();
            syncState.filesUpdated = downloaded;

            if (syncState.status === 'success') {
              syncState.lastSuccessTime = syncState.lastSyncTime;
            }

            log('info', `Sync complete: ${downloaded} downloaded, ${failed} failed out of ${SYNC_FILES.length}`);
            conn.end();
            resolve(syncState);
          }
        };

        for (const file of SYNC_FILES) {
          const remotePath = `${CONFIG.remotePath}/${file}`;
          const localPath = path.join(CONFIG.cachePath, file);

          // Ensure local directory exists
          const localDir = path.dirname(localPath);
          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }

          sftp.readFile(remotePath, 'utf8', (err, data) => {
            if (err) {
              // File might not exist yet — that's okay
              if (err.code === 2) {
                // SFTP status code 2 = No such file
                log('warn', `File not found on server: ${file}`);
              } else {
                log('error', `Error reading ${file}: ${err.message}`);
              }
              failed++;
              checkDone();
              return;
            }

            // Validate JSON
            try {
              JSON.parse(data);
            } catch (parseErr) {
              log('error', `Invalid JSON in ${file}: ${parseErr.message}`);
              failed++;
              checkDone();
              return;
            }

            // Write to local cache
            try {
              fs.writeFileSync(localPath, data, 'utf8');
              downloaded++;
            } catch (writeErr) {
              log('error', `Error writing ${file}: ${writeErr.message}`);
              failed++;
            }
            checkDone();
          });
        }
      });
    });

    conn.on('error', (err) => {
      log('error', `SSH connection error: ${err.message}`);
      syncState.status = 'error';
      syncState.lastError = err.message;
      syncState.lastSyncTime = new Date().toISOString();
      reject(err);
    });

    conn.on('timeout', () => {
      log('error', 'SSH connection timeout');
      syncState.status = 'error';
      syncState.lastError = 'Connection timeout';
      syncState.lastSyncTime = new Date().toISOString();
      reject(new Error('Connection timeout'));
    });

    log('info', `Connecting to ${CONFIG.ssh.host}:${CONFIG.ssh.port}...`);

    conn.connect({
      host: CONFIG.ssh.host,
      port: CONFIG.ssh.port,
      username: CONFIG.ssh.username,
      privateKey,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
    });
  });
}

// ─── Read cached file ───
function readCachedFile(filePath) {
  const fullPath = path.join(CONFIG.cachePath, filePath);
  try {
    if (!fs.existsSync(fullPath)) return null;
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    log('warn', `Error reading cached file ${filePath}: ${err.message}`);
    return null;
  }
}

// ─── HTTP API Server ───
function startServer() {
  const server = http.createServer((req, res) => {
    // CORS headers for frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url, `http://localhost:${CONFIG.port}`);
    const pathname = url.pathname;

    // ── API Routes ──

    // GET /api/sync/status — sync state
    if (pathname === '/api/sync/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(syncState));
    }

    // POST /api/sync/trigger — trigger manual sync
    if (pathname === '/api/sync/trigger' && req.method === 'POST') {
      performSync()
        .then((state) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(state));
        })
        .catch((err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message, syncState }));
        });
      return;
    }

    // GET /api/sync/log — sync log
    if (pathname === '/api/sync/log') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(syncLog.slice(0, 50)));
    }

    // GET /api/data/:path — serve any cached data file
    if (pathname.startsWith('/api/data/')) {
      const filePath = pathname.replace('/api/data/', '');
      // Security: prevent directory traversal
      if (filePath.includes('..') || filePath.startsWith('/')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid path' }));
      }

      const data = readCachedFile(filePath);
      if (data === null) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'File not found in cache', file: filePath }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    // GET /api/all — return ALL cached data in one request (for initial load)
    if (pathname === '/api/all') {
      const allData = {};
      for (const file of SYNC_FILES) {
        const data = readCachedFile(file);
        if (data !== null) {
          // Convert file path to a key: "normalized/persons.json" -> "normalized_persons"
          const key = file.replace('.json', '').replace(/\//g, '_');
          allData[key] = data;
        }
      }
      allData._syncState = syncState;
      allData._cachedAt = new Date().toISOString();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(allData));
    }

    // GET /api/health — server health check
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'ok',
        uptime: process.uptime(),
        syncState: syncState.status,
        lastSync: syncState.lastSyncTime,
        cacheFiles: SYNC_FILES.filter(f => fs.existsSync(path.join(CONFIG.cachePath, f))).length,
      }));
    }

    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(CONFIG.port, () => {
    log('info', `API server running at http://localhost:${CONFIG.port}`);
    log('info', `Frontend should connect to http://localhost:${CONFIG.port}/api/`);
    console.log('');
    console.log('  Available endpoints:');
    console.log(`    GET  http://localhost:${CONFIG.port}/api/health`);
    console.log(`    GET  http://localhost:${CONFIG.port}/api/all`);
    console.log(`    GET  http://localhost:${CONFIG.port}/api/data/<file>`);
    console.log(`    GET  http://localhost:${CONFIG.port}/api/sync/status`);
    console.log(`    POST http://localhost:${CONFIG.port}/api/sync/trigger`);
    console.log(`    GET  http://localhost:${CONFIG.port}/api/sync/log`);
    console.log('');
  });
}

// ─── Main ───
async function main() {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   משפחטון — Mishpachton Sync Server  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');

  ensureDirs();

  // Start HTTP server immediately (serves cached data)
  startServer();

  // Perform initial sync
  try {
    await performSync();
  } catch (err) {
    log('warn', `Initial sync failed: ${err.message}. Will serve cached data if available.`);
  }

  // Auto-sync every 5 minutes
  setInterval(async () => {
    try {
      await performSync();
    } catch (err) {
      log('warn', `Auto-sync failed: ${err.message}`);
    }
  }, CONFIG.autoSyncIntervalMs);
}

main();
