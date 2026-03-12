# משפחטון — Mishpachton Family Operations App

## Product-grade Hebrew-first family management web application

---

## 1. Product Specification

### 1.1 Product Goals
- Provide a calm, reliable, analytics-rich interface for managing a household with a newborn
- Present structured data prepared by OpenClaw in a beautiful Hebrew RTL experience
- Remain fully functional offline using local cache
- Support future English publishing mode without architecture changes

### 1.2 Primary Personas
- **Mother (שירה)** — Primary user, postpartum, needs quick glances at baby status, her own recovery tracking, task management
- **Father (אדם)** — Task handler, logistics coordinator, appointment tracker
- **Extended family** — Future read-only share mode

### 1.3 Core User Journeys
1. **Quick Status Check** — Open app → Dashboard shows last feeding, sleep totals, diaper count, alerts
2. **Baby Deep Dive** — Navigate to Baby → Browse feeding/sleep/diaper timelines with charts
3. **Mother Recovery** — Check hydration, supplements, mood/energy trends
4. **Task Management** — View overdue tasks, filter by category, track completion
5. **Appointment Prep** — See upcoming appointments with prep tasks and provider info
6. **Analytics Review** — Weekly trend analysis across all metrics
7. **Sync Management** — Check sync status, trigger manual sync, review logs

### 1.4 Information Architecture
```
Dashboard (Home)
├── Today overview with stat cards
├── Active alerts
├── Mother check-in summary
├── Upcoming appointments
└── Sync status

Baby Module
├── Feeding (timeline + analytics)
├── Sleep (timeline + analytics)  
├── Diapers (log + charts)
├── Health (weight/growth, vitals, milestones)
└── Medications/Vitamins

Mother Recovery
├── Daily check-in (hydration, supplements, mood, energy)
├── Sleep trends
├── Mood/energy trends
├── Hydration tracking
└── Symptom frequency

Tasks
├── Task board with filters
├── Priority/category/assignee filtering
├── Overdue highlighting
└── Completed history

Appointments
├── Upcoming list
├── Past appointments
├── Prep tasks
└── Visit summaries

Timeline
├── Unified event timeline
├── Person/type/date filters
├── Search
├── Grouped and detailed views

Analytics
├── Combined overview charts
├── Per-metric trends
├── Alerts & anomalies
└── Generated insights

Settings
├── Sync configuration
├── Sync status & manual sync
├── Cache health
├── Sync log
└── Language settings (scaffold)
```

### 1.5 Screen States
Every screen handles: loading, empty, stale data, error, offline, partial data, syncing

### 1.6 i18n Strategy
- All UI strings in `src/i18n/dictionaries.ts` with `he` and `en` dictionaries
- `t('path.to.key')` function for string lookup with interpolation
- Internal keys are language-neutral English identifiers
- Future: swap locale to `en` and all UI text changes

---

## 2. Technical Architecture

### 2.1 Stack Choices
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| UI Framework | React 18 + TypeScript | Typed, component-based, excellent ecosystem |
| Build Tool | Vite 5 | Fast HMR, optimized builds |
| Styling | Tailwind CSS | RTL-friendly, utility-first, design system support |
| State | Zustand | Minimal, typed, no boilerplate |
| Charts | Recharts | React-native, composable, good RTL support |
| Icons | Lucide React | Consistent, tree-shakeable |
| Dates | date-fns + he locale | Immutable, Hebrew locale support |
| Future Sync | SSH2/SFTP (Node) | Native SSH support for secure file sync |

### 2.2 Architecture Layers
```
┌─────────────────────────────────────────────┐
│              Layer F: UI Layer              │
│   React components, screens, navigation     │
├─────────────────────────────────────────────┤
│         Layer E: View Model / Adapters      │
│   Screen-specific data preparation          │
├─────────────────────────────────────────────┤
│          Layer D: Domain Models             │
│   Typed interfaces, enum normalization      │
├─────────────────────────────────────────────┤
│         Layer C: Data Access Layer          │
│   Repositories, safe parsers, selectors     │
├─────────────────────────────────────────────┤
│          Layer B: Local Cache               │
│   Versioned file cache, snapshots           │
├─────────────────────────────────────────────┤
│           Layer A: Sync Layer               │
│   SSH/SFTP, file discovery, validation      │
└─────────────────────────────────────────────┘
```

### 2.3 Folder Structure
```
src/
├── types/              # Domain type definitions
│   └── domain.ts       # All typed models
├── i18n/               # Internationalization
│   ├── index.ts        # t() function, locale management
│   └── dictionaries.ts # he + en string dictionaries
├── utils/              # Shared utilities
│   └── index.ts        # Date formatting, grouping, colors
├── hooks/              # React hooks and state
│   └── useAppStore.ts  # Zustand global store
├── layers/             # Architecture layers
│   ├── sync/           # (Layer A) SSH/SFTP sync service
│   ├── cache/          # (Layer B) Local cache manager
│   └── data-access/    # (Layer C) Repositories
│       ├── mockData.ts # Demo data provider
│       └── repositories.ts # Typed data accessors
├── components/         # Shared UI components
│   ├── common/         # Card, Badge, Tabs, States, etc.
│   ├── charts/         # Chart wrappers
│   └── layout/         # Sidebar, Header
├── modules/            # Feature modules
│   ├── dashboard/
│   ├── baby/
│   ├── mother/
│   ├── tasks/
│   ├── appointments/
│   ├── timeline/
│   ├── analytics/
│   └── settings/
├── App.tsx             # Root component + routing
├── main.tsx            # Entry point
└── index.css           # Global styles + design system
```

### 2.4 Sync Workflow
```
Startup:
1. Load local cache → render UI immediately
2. Show "syncing" indicator
3. Connect SSH/SFTP → list remote files
4. Compare timestamps/checksums
5. Download changed files to staging
6. Validate JSON integrity
7. Atomic swap: staging → active cache
8. Preserve last-known-good snapshot
9. Refresh repositories → re-render UI
10. Show success/failure status

Manual Sync:
- Same pipeline, triggered by user
- Never corrupts active cache
- Logs results
```

### 2.5 Cache Strategy
```
/cache/
├── active/            # Current working dataset
├── staging/           # Incoming sync data (validated before promotion)
├── snapshots/         # Last-known-good backup
├── metadata.json      # Version, timestamps, file inventory
└── sync-log.json      # Sync operation history
```

---

## 3. Setup & Configuration

### 3.1 Local Setup
```bash
git clone <repo>
cd mishpachton
npm install
npm run dev
```

### 3.2 Environment Variables
```env
# .env.local
VITE_SYNC_HOST=192.168.1.100
VITE_SYNC_PORT=22
VITE_SYNC_USERNAME=family-sync
VITE_SYNC_REMOTE_PATH=/data
VITE_SYNC_AUTO_ON_STARTUP=true
VITE_SYNC_INTERVAL_MINUTES=30
# Private key path (server-side only, never in client bundle)
SYNC_PRIVATE_KEY_PATH=~/.ssh/family_sync_rsa
```

### 3.3 SSH/SFTP Configuration
- Generate a dedicated SSH key pair for the sync user
- Add the public key to the remote server's `authorized_keys`
- Store private key securely (OS keychain or file with 600 permissions)
- Never commit private keys to source control
- Configure `known_hosts` for host verification

### 3.4 Sync Behavior
- On startup: auto-sync if enabled (loads cache first for instant UI)
- Manual sync available in Settings
- Failed syncs preserve current local data
- Sync log records all operations

### 3.5 Cache Behavior
- Valid sync → promote staging to active, archive old active as snapshot
- Invalid sync → keep current active, log error
- No cache + failed sync → show onboarding/error state
- Stale cache → show stale data notice, continue rendering

### 3.6 Recovery from Bad Sync
1. App automatically falls back to last-known-good snapshot
2. Stale data banner appears
3. Check sync log in Settings for error details
4. Fix remote data or connectivity issue
5. Trigger manual sync

### 3.7 Troubleshooting Malformed Files
- Each file is parsed independently with try/catch
- Malformed files don't crash other data
- Partial data renders with "some data unavailable" notices
- Check browser console for specific parse errors

### 3.8 Adding New Data Entities
1. Add type definition in `src/types/domain.ts`
2. Add mock data in `src/layers/data-access/mockData.ts`
3. Add repository in `src/layers/data-access/repositories.ts`
4. Add Hebrew labels in `src/i18n/dictionaries.ts`
5. Create module screen in `src/modules/<entity>/`
6. Add navigation entry in Sidebar

### 3.9 Enabling English Mode
1. Complete the `en` dictionary in `src/i18n/dictionaries.ts`
2. Call `setLocale('en')` to switch
3. Add language toggle in Settings screen
4. All `t()` calls will automatically resolve to English strings
5. RTL/LTR direction switches automatically with locale
