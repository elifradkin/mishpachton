import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, SectionHeader, Badge, EmptyState } from '../../components/common';
import { Clock } from 'lucide-react';

export function TimelineScreen() {
  const timeline = useDataStore(s => s.getTimeline());
  const feedings = useDataStore(s => s.getFeedings());
  const diapers = useDataStore(s => s.getDiapers());
  const sleepLog = useDataStore(s => s.getSleep());
  // Build timeline from raw data if derived timeline is empty
  const entries = timeline.length > 0 ? timeline : [
    ...feedings.map((f: any) => ({ id: f.id, type: 'feeding', time: f.start_time, date: f.date, title: f.type_he || f.type, subtitle: f.amount_ml ? `${f.amount_ml} מ״ל` : f.duration_min ? `${f.duration_min} דק׳` : '' })),
    ...diapers.map((d: any) => ({ id: d.id, type: 'diaper', time: d.time, date: d.date, title: d.type_he || d.type, subtitle: '' })),
    ...sleepLog.map((s: any) => ({ id: s.id || `sleep-${s.date}`, type: 'sleep', time: s.start_time, date: s.date, title: s.type_he || 'שינה', subtitle: s.duration_min ? `${s.duration_min} דק׳` : '' })),
  ].sort((a: any, b: any) => (b.date + b.time).localeCompare(a.date + a.time));
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-1">ציר זמן</h1>
      <p className="text-sage-500 text-sm mb-6">{entries.length} אירועים</p>
      {entries.length === 0 ? <EmptyState title="אין אירועים" icon={<Clock size={40} className="text-sage-300 mb-3" />} /> : (
        <div className="space-y-2">{entries.map((e: any, i: number) => (
          <Card key={e.id || i} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${e.type === 'feeding' ? 'bg-brand-400' : e.type === 'diaper' ? 'bg-sage-400' : 'bg-sky-400'}`} />
                <div><p className="font-medium text-sage-800 text-sm">{e.title_he || e.title}</p>{e.subtitle && <p className="text-xs text-sage-400">{e.subtitle_he || e.subtitle}</p>}</div>
              </div>
              <span className="text-xs text-sage-400">{e.date} {e.time || e.timestamp?.split('T')[1]?.slice(0, 5) || ''}</span>
            </div>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
