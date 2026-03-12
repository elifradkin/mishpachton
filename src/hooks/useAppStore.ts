import { create } from 'zustand';
import type { SyncStatus, Locale } from '../types/domain';

interface AppState {
  // Sync
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  lastError: string | null;
  isAutoSyncEnabled: boolean;

  // UI
  sidebarOpen: boolean;
  locale: Locale;
  activeModule: string;

  // Actions
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncTime: (time: string) => void;
  setLastError: (error: string | null) => void;
  toggleAutoSync: () => void;
  toggleSidebar: () => void;
  setLocale: (locale: Locale) => void;
  setActiveModule: (module: string) => void;
  triggerSync: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  syncStatus: 'success',
  lastSyncTime: new Date(Date.now() - 30 * 60000).toISOString(),
  lastError: null,
  isAutoSyncEnabled: true,
  sidebarOpen: true,
  locale: 'he',
  activeModule: 'dashboard',

  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setLastError: (error) => set({ lastError: error }),
  toggleAutoSync: () => set((s) => ({ isAutoSyncEnabled: !s.isAutoSyncEnabled })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLocale: (locale) => set({ locale }),
  setActiveModule: (module) => set({ activeModule: module }),

  triggerSync: async () => {
    set({ syncStatus: 'syncing', lastError: null });
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const success = Math.random() > 0.15;
    if (success) {
      set({
        syncStatus: 'success',
        lastSyncTime: new Date().toISOString(),
        lastError: null,
      });
    } else {
      set({
        syncStatus: 'error',
        lastError: 'שגיאת חיבור לשרת — timeout',
      });
    }
  },
}));
