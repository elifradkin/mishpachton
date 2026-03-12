import React from 'react';
import { t } from '../../i18n';
import { useAppStore } from '../../hooks/useAppStore';
import {
  LayoutDashboard, Baby, Heart, ListTodo, Calendar,
  Clock, BarChart3, Settings, ChevronRight, ChevronLeft, RefreshCw, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';

interface NavItem {
  key: string;
  labelKey: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard size={20} /> },
  { key: 'baby', labelKey: 'nav.baby', icon: <Baby size={20} /> },
  { key: 'mother', labelKey: 'nav.mother', icon: <Heart size={20} /> },
  { key: 'tasks', labelKey: 'nav.tasks', icon: <ListTodo size={20} /> },
  { key: 'appointments', labelKey: 'nav.appointments', icon: <Calendar size={20} /> },
  { key: 'timeline', labelKey: 'nav.timeline', icon: <Clock size={20} /> },
  { key: 'analytics', labelKey: 'nav.analytics', icon: <BarChart3 size={20} /> },
  { key: 'settings', labelKey: 'nav.settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { activeModule, setActiveModule, sidebarOpen, toggleSidebar, syncStatus, lastSyncTime } = useAppStore();

  const syncIcon = syncStatus === 'syncing' ? (
    <RefreshCw size={14} className="animate-spin text-sky-500" />
  ) : syncStatus === 'error' ? (
    <WifiOff size={14} className="text-rose-400" />
  ) : syncStatus === 'stale' ? (
    <AlertTriangle size={14} className="text-brand-400" />
  ) : (
    <Wifi size={14} className="text-sage-400" />
  );

  return (
    <aside
      className={`fixed top-0 right-0 h-full bg-white border-l border-sage-100 z-40 transition-all duration-300 flex flex-col ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sage-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
          מ
        </div>
        {sidebarOpen && (
          <span className="font-display font-bold text-sage-800 text-lg">
            {t('app.name')}
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeModule === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 text-sm font-medium ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
              }`}
              title={!sidebarOpen ? t(item.labelKey) : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-brand-500' : ''}`}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{t(item.labelKey)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sync Status */}
      <div className="px-3 py-3 border-t border-sage-100 flex-shrink-0">
        <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'justify-center'}`}>
          {syncIcon}
          {sidebarOpen && (
            <span className="text-xs text-sage-400">
              {syncStatus === 'syncing' ? t('sync.syncing') : 
               syncStatus === 'error' ? t('sync.error') :
               lastSyncTime ? t('sync.lastSync') : t('sync.never')}
            </span>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-white border border-sage-200 flex items-center justify-center text-sage-400 hover:text-sage-600 hover:border-sage-300 transition-colors shadow-sm"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
}
