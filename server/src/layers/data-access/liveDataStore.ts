import { create } from 'zustand';
import { fetchAllData, triggerSync as apiTriggerSync, checkBackendHealth } from '../sync/apiClient';
import type { AllDataResponse } from '../sync/apiClient';

// Safe accessor helper
function dig(obj: any, ...keys: string[]): any {
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

interface DataState {
  raw: AllDataResponse | null;
  isLoading: boolean;
  isBackendOnline: boolean;
  lastFetchTime: string | null;
  error: string | null;
  loadData: () => Promise<void>;
  triggerSync: () => Promise<void>;
  checkHealth: () => Promise<boolean>;
  getFamily: () => any[];
  getFeedings: () => any[];
  getFeedingsNormalized: () => any[];
  getDiapers: () => any[];
  getSleep: () => any[];
  getHealth: () => any;
  getRecovery: () => any;
  getTasks: () => any[];
  getAppointments: () => any[];
  getPersons: () => any[];
  getDashboard: () => any;
  getAlerts: () => any[];
  getTimeline: () => any[];
  getMotherMetrics: () => any;
  getBabyMetrics: () => any;
  getLatestState: () => any;
  getSyncState: () => any;
}

export const useDataStore = create<DataState>((set, get) => ({
  raw: null,
  isLoading: false,
  isBackendOnline: false,
  lastFetchTime: null,
  error: null,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAllData();
      if (data) {
        set({ raw: data, isLoading: false, isBackendOnline: true, lastFetchTime: new Date().toISOString(), error: null });
      } else {
        set({ isLoading: false, isBackendOnline: false, error: 'לא ניתן לטעון נתונים' });
      }
    } catch (err: any) {
      set({ isLoading: false, isBackendOnline: false, error: err.message });
    }
  },

  triggerSync: async () => {
    const result = await apiTriggerSync();
    if (result) await get().loadData();
  },

  checkHealth: async () => {
    const online = await checkBackendHealth();
    set({ isBackendOnline: online });
    return online;
  },

  getFamily: () => dig(get().raw, 'family', 'family') || dig(get().raw, 'normalized_persons', 'persons') || [],
  getFeedings: () => dig(get().raw, 'feeding', 'feeding_log') || [],
  getFeedingsNormalized: () => dig(get().raw, 'normalized_feedings', 'feedings') || dig(get().raw, 'feeding', 'feeding_log') || [],
  getDiapers: () => dig(get().raw, 'diapers', 'diaper_log') || dig(get().raw, 'normalized_diapers', 'diapers') || [],
  getSleep: () => dig(get().raw, 'sleep', 'sleep_log') || dig(get().raw, 'normalized_sleeps', 'sleeps') || [],
  getHealth: () => dig(get().raw, 'health') || dig(get().raw, 'normalized_health_logs') || null,
  getRecovery: () => dig(get().raw, 'recovery') || null,
  getTasks: () => dig(get().raw, 'tasks', 'tasks') || dig(get().raw, 'normalized_tasks', 'tasks') || [],
  getAppointments: () => dig(get().raw, 'appointments', 'appointments') || dig(get().raw, 'normalized_appointments', 'appointments') || [],
  getPersons: () => dig(get().raw, 'normalized_persons', 'persons') || dig(get().raw, 'family', 'family') || [],
  getDashboard: () => dig(get().raw, 'derived_dashboard_today') || null,
  getAlerts: () => {
    const a = dig(get().raw, 'derived_alerts_open');
    if (a && Array.isArray(a.alerts)) return a.alerts;
    if (Array.isArray(a)) return a;
    return [];
  },
  getTimeline: () => {
    const t = dig(get().raw, 'derived_timeline_flat');
    if (t && Array.isArray(t.entries)) return t.entries;
    if (Array.isArray(t)) return t;
    return [];
  },
  getMotherMetrics: () => dig(get().raw, 'derived_mother_recovery_metrics') || null,
  getBabyMetrics: () => dig(get().raw, 'derived_baby_daily_metrics') || null,
  getLatestState: () => dig(get().raw, 'indexes_latest_state') || null,
  getSyncState: () => dig(get().raw, '_syncState') || { status: 'idle', lastSyncTime: null },
}));
