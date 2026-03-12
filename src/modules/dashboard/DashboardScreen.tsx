import React, { useState } from 'react';
import { t } from '../../i18n';
import { getGreeting, formatRelativeTime, formatDuration } from '../../utils';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, StatCard, SectionHeader, Badge, EmptyState } from '../../components/common';
import { Baby, Droplets, Moon, AlertTriangle, ListTodo, RefreshCw, Clock } from 'lucide-react';

export function DashboardScreen() {
  const { triggerSync, isBackendOnline, lastFetchTime } = useDataStore();
  const dashboard = useDataStore(s => s.getDashboard());
  const alerts = useDataStore(s => s.getAlerts());
  const feedings = useDataStore(s => s.getFeedings());
  const diapers = useDataStore(s => s.getDiapers());
  const sleepLog = useDataStore(s => s.getSleep());
  const tasks = useDataStore(s => s.getTasks());
  const persons = useDataStore(s => s.getPersons());
  const appointments = useDataStore(s => s.getAppointments());
  const recovery = useDataStore(s => s.getRecovery());

  const baby = persons.find((p: any) => p.role === 'baby');
  const openTasks = tasks.filter((t: any) => t.status === 'פעיל' || t.status === 'todo' || t.status === 'in_progress');
  const summaryCards = dashboard?.summary_cards || [];

  const [syncing, setSyncing] = useState(false);
  const handleSync = async () => { setSyncing(true); await triggerSync(); setSyncing(false); };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-sage-900">{t(getGreeting())} ☀️</h1>
          <p className="text-sage-500 text-sm mt-0.5">
            {baby ? `${baby.name} — בת ${baby.age_days ?? ''} ימים` : 'סקירת היום'}
          </p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn btn-ghost text-sage-500 hover:text-brand-500">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'מסנכרן...' : 'סנכרן'}
        </button>
      </div>

      {/* Summary Cards */}
      {summaryCards.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card: any) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-sage-500 font-medium mb-1">{card.title_he}</p>
                  <p className="font-display font-bold text-2xl text-sage-900">{card.value}</p>
                  <p className="text-xs text-sage-400 mt-0.5">{card.subtitle_he}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="האכלות" value={feedings.length} icon={<Baby size={20} />} color="text-brand-600" />
          <StatCard label="חיתולים" value={diapers.length} icon={<Droplets size={20} />} color="text-sage-700" />
          <StatCard label="שינה" value={sleepLog.length > 0 ? formatDuration(sleepLog.reduce((s: number, x: any) => s + (x.duration_min || 0), 0)) : 'אין נתונים'} icon={<Moon size={20} />} color="text-sky-600" />
          <StatCard label="משימות" value={openTasks.length} icon={<ListTodo size={20} />} color="text-sage-700" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div>
              <SectionHeader title="התראות" />
              <div className="space-y-2">{alerts.map((a: any, i: number) => (
                <Card key={a.id || i} className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    <div><p className="font-medium text-sage-800 text-sm">{a.title_he || a.title}</p><p className="text-xs text-sage-500">{a.message_he || a.message}</p></div>
                  </div>
                </Card>
              ))}</div>
            </div>
          )}

          {/* Feedings */}
          {feedings.length > 0 && (
            <div>
              <SectionHeader title={`האכלות אחרונות (${feedings.length})`} />
              <div className="space-y-2">{feedings.slice().reverse().slice(0, 6).map((f: any) => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-400" />
                      <div>
                        <p className="font-medium text-sage-800 text-sm">{f.type_he || f.type}</p>
                        <p className="text-xs text-sage-400">{f.date} · {f.start_time}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {f.duration_min && <Badge>{f.duration_min} דק׳</Badge>}
                      {f.amount_ml && <Badge variant="info">{f.amount_ml} מ״ל</Badge>}
                      {f.side_first && <Badge variant="default">{f.side_first === 'both' ? 'שני הצדדים' : f.side_first === 'left' ? 'שמאל' : f.side_first === 'right' ? 'ימין' : f.side_first}</Badge>}
                    </div>
                  </div>
                  {f.notes && <p className="text-xs text-sage-400 mt-1 mr-5">{f.notes}</p>}
                </Card>
              ))}</div>
            </div>
          )}

          {/* Tasks */}
          {openTasks.length > 0 && (
            <div>
              <SectionHeader title={`משימות (${openTasks.length})`} />
              <div className="space-y-2">{openTasks.map((task: any) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sage-800 text-sm">{task.title}</p>
                    <Badge variant={task.priority === 'גבוהה' ? 'warning' : 'default'}>{task.priority}</Badge>
                  </div>
                </Card>
              ))}</div>
            </div>
          )}

          {feedings.length === 0 && alerts.length === 0 && openTasks.length === 0 && (
            <EmptyState title="אין נתונים עדיין" description="הפעל את שרת הסנכרון כדי לטעון נתונים מהשרת" />
          )}
        </div>

        <div className="space-y-4">
          {/* Family */}
          <div>
            <SectionHeader title="בני המשפחה" />
            <div className="space-y-2">{persons.map((p: any) => (
              <Card key={p.id} className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.role === 'baby' ? '👶' : p.role === 'mother' ? '👩' : p.role === 'father' ? '👨' : '🧒'}</span>
                  <div>
                    <p className="font-medium text-sage-800 text-sm">{p.name}</p>
                    <p className="text-xs text-sage-400">{p.role === 'baby' && p.age_days != null ? `בת ${p.age_days} ימים` : p.age_years ? `בן/בת ${p.age_years}` : ''}</p>
                  </div>
                </div>
              </Card>
            ))}</div>
          </div>

          {/* Sync */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-sage-400" />
              <span className="text-xs text-sage-500 font-medium">מצב סנכרון</span>
            </div>
            <p className="text-sm text-sage-600">{isBackendOnline ? '🟢 מחובר לשרת' : '🔴 לא מחובר'}</p>
            <p className="text-xs text-sage-400 mt-1">{lastFetchTime ? `עדכון: ${formatRelativeTime(lastFetchTime)}` : 'טרם סונכרן'}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
