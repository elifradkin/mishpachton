import React, { useEffect, useState } from 'react';
import { useAppStore } from './hooks/useAppStore';
import { useDataStore } from './layers/data-access/liveDataStore';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardScreen } from './modules/dashboard/DashboardScreen';
import { BabyScreen } from './modules/baby/BabyScreen';
import { MotherScreen } from './modules/mother/MotherScreen';
import { TasksScreen } from './modules/tasks/TasksScreen';
import { AppointmentsScreen } from './modules/appointments/AppointmentsScreen';
import { TimelineScreen } from './modules/timeline/TimelineScreen';
import { AnalyticsScreen } from './modules/analytics/AnalyticsScreen';
import { SettingsScreen } from './modules/settings/SettingsScreen';

function ModuleRouter() {
  const { activeModule } = useAppStore();

  switch (activeModule) {
    case 'dashboard': return <DashboardScreen />;
    case 'baby': return <BabyScreen />;
    case 'mother': return <MotherScreen />;
    case 'tasks': return <TasksScreen />;
    case 'appointments': return <AppointmentsScreen />;
    case 'timeline': return <TimelineScreen />;
    case 'analytics': return <AnalyticsScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <DashboardScreen />;
  }
}

export default function App() {
  const { sidebarOpen } = useAppStore();
  const { loadData, isBackendOnline } = useDataStore();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    loadData().finally(() => setInitialLoadDone(true));
    const interval = setInterval(() => loadData(), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!initialLoadDone) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4 animate-pulse">
            מ
          </div>
          <p className="text-sage-600 font-medium">טוען נתונים...</p>
          <p className="text-sage-400 text-sm mt-1">מתחבר לשרת הסנכרון</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'mr-60' : 'mr-16'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {!isBackendOnline && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-brand-700 text-sm mb-4">
              <span>⚠️</span>
              <span>השרת אינו זמין — נתונים לא עדכניים. הפעל את שרת הסנכרון.</span>
            </div>
          )}
          <ModuleRouter />
        </div>
      </main>
    </div>
  );
}
