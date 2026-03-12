import React, { useState } from 'react';
import { t } from '../../i18n';
import { formatDuration } from '../../utils';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, StatCard, SectionHeader, Badge, Tabs, EmptyState } from '../../components/common';
import { Baby, Moon, Droplets, Activity, Pill } from 'lucide-react';

const subTabs = [
  { key: 'feeding', label: 'האכלה' },
  { key: 'sleep', label: 'שינה' },
  { key: 'diapers', label: 'חיתולים' },
  { key: 'health', label: 'בריאות' },
];

export function BabyScreen() {
  const [activeTab, setActiveTab] = useState('feeding');
  const persons = useDataStore(s => s.getPersons());
  const baby = persons.find((p: any) => p.role === 'baby');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">תינוק — {baby?.name || 'תינוק'} 👶</h1>
        <p className="text-sage-500 text-sm mt-0.5">{baby?.age_days != null ? `בת ${baby.age_days} ימים` : ''}</p>
      </div>
      <Tabs tabs={subTabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />
      {activeTab === 'feeding' && <FeedingTab />}
      {activeTab === 'sleep' && <SleepTab />}
      {activeTab === 'diapers' && <DiaperTab />}
      {activeTab === 'health' && <HealthTab />}
    </div>
  );
}

function FeedingTab() {
  const feedings = useDataStore(s => s.getFeedings());
  const totalMin = feedings.reduce((s: number, f: any) => s + (f.duration_min || 0), 0);
  const totalMl = feedings.reduce((s: number, f: any) => s + (f.amount_ml || 0), 0);

  if (feedings.length === 0) return <EmptyState title="אין נתוני האכלה" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="סה״כ האכלות" value={feedings.length} icon={<Baby size={20} />} color="text-brand-600" />
        <StatCard label="זמן כולל" value={totalMin > 0 ? formatDuration(totalMin) : '—'} color="text-sage-700" />
        <StatCard label="כמות (מ״ל)" value={totalMl > 0 ? `${totalMl} מ״ל` : '—'} color="text-sky-600" />
        <StatCard label="אחרונה" value={feedings[feedings.length - 1]?.start_time || '—'} color="text-brand-500" />
      </div>
      <div>
        <SectionHeader title="היסטוריית האכלות" />
        <div className="space-y-2">
          {feedings.slice().reverse().map((f: any) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${f.type === 'nursing' ? 'bg-brand-400' : 'bg-sky-400'}`} />
                  <div>
                    <p className="font-medium text-sage-800 text-sm">{f.type_he || f.type}</p>
                    <p className="text-xs text-sage-400">{f.date} · {f.start_time}{f.end_time ? ` — ${f.end_time}` : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {f.duration_min && <Badge>{f.duration_min} דק׳</Badge>}
                  {f.amount_ml && <Badge variant="info">{f.amount_ml} מ״ל</Badge>}
                  {f.formula_brand && <Badge variant="default">{f.formula_brand}</Badge>}
                  {f.side_first && <Badge variant="default">{f.side_first === 'both' ? 'שני הצדדים' : f.side_first === 'left' ? 'שמאל' : 'ימין'}</Badge>}
                </div>
              </div>
              {f.notes && <p className="text-xs text-sage-400 mt-1 mr-5">{f.notes}</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SleepTab() {
  const sleepLog = useDataStore(s => s.getSleep());
  if (sleepLog.length === 0) return <EmptyState title="אין נתוני שינה עדיין" description="נתוני שינה יופיעו כשיתעדכנו בשרת" />;
  const totalMin = sleepLog.reduce((s: number, x: any) => s + (x.duration_min || 0), 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="שינה כוללת" value={formatDuration(totalMin)} icon={<Moon size={20} />} color="text-sky-600" />
        <StatCard label="ישיבות" value={sleepLog.length} color="text-sky-500" />
        <StatCard label="ממוצע" value={sleepLog.length > 0 ? formatDuration(Math.round(totalMin / sleepLog.length)) : '—'} />
      </div>
      <div className="space-y-2">
        {sleepLog.slice().reverse().map((s: any, i: number) => (
          <Card key={s.id || i} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sage-800 text-sm">{s.type_he || s.type || 'שינה'}</p>
                <p className="text-xs text-sage-400">{s.date} · {s.start_time} — {s.end_time || 'עדיין'}</p>
              </div>
              {s.duration_min && <span className="text-sm text-sage-500">{formatDuration(s.duration_min)}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DiaperTab() {
  const diapers = useDataStore(s => s.getDiapers());
  if (diapers.length === 0) return <EmptyState title="אין נתוני חיתולים עדיין" />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="סה״כ חיתולים" value={diapers.length} icon={<Droplets size={20} />} color="text-sage-700" />
        <StatCard label="רטוב" value={diapers.filter((d: any) => d.type === 'wet' || d.type === 'both' || d.type === 'פיפי').length} color="text-sky-500" />
        <StatCard label="מלוכלך" value={diapers.filter((d: any) => d.type === 'dirty' || d.type === 'both' || d.type === 'קקי').length} color="text-brand-500" />
      </div>
      <div className="space-y-2">
        {diapers.slice().reverse().map((d: any) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${d.type === 'wet' ? 'bg-sky-400' : d.type === 'dirty' ? 'bg-brand-400' : 'bg-sage-400'}`} />
                <div>
                  <p className="font-medium text-sage-800 text-sm">{d.type_he || d.type}</p>
                  <p className="text-xs text-sage-400">{d.date} · {d.time}</p>
                </div>
              </div>
              {d.notes && <span className="text-xs text-sage-400">{d.notes}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HealthTab() {
  const health = useDataStore(s => s.getHealth());
  if (!health) return <EmptyState title="אין נתוני בריאות עדיין" />;
  return (
    <div className="space-y-4">
      <SectionHeader title="נתוני בריאות" />
      <Card className="p-4">
        <pre className="text-xs text-sage-600 whitespace-pre-wrap" dir="rtl">
          {typeof health === 'object' ? JSON.stringify(health, null, 2).slice(0, 1000) : String(health)}
        </pre>
      </Card>
    </div>
  );
}
