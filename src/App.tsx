import React from 'react';
import { useAppStore } from './hooks/useAppStore';
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

  return (
    <div className="min-h-screen bg-cream-50">
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'mr-60' : 'mr-16'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <ModuleRouter />
        </div>
      </main>
    </div>
  );
}
