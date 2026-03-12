import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, SectionHeader, StatCard, EmptyState } from '../../components/common';
import { BarChart3 } from 'lucide-react';

export function AnalyticsScreen() {
  const feedings = useDataStore(s => s.getFeedings());
  const diapers = useDataStore(s => s.getDiapers());
  const sleepLog = useDataStore(s => s.getSleep());
  const babyMetrics = useDataStore(s => s.getBabyMetrics());
  if (feedings.length === 0 && !babyMetrics) return <div className="animate-fade-in"><h1 className="font-display font-bold text-2xl text-sage-900 mb-4">אנליטיקה 📈</h1><EmptyState title="אין מספיק נתונים לניתוח" /></div>;
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-6">אנליטיקה 📈</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="סה״כ האכלות" value={feedings.length} color="text-brand-600" />
        <StatCard label="סה״כ חיתולים" value={diapers.length} color="text-sage-700" />
        <StatCard label="ישיבות שינה" value={sleepLog.length} color="text-sky-600" />
        <StatCard label="ימים עם נתונים" value={[...new Set(feedings.map((f: any) => f.date))].length} color="text-sage-600" />
      </div>
      {babyMetrics && <Card className="p-5"><SectionHeader title="מדדי תינוק יומיים" /><pre className="text-xs text-sage-600 whitespace-pre-wrap" dir="rtl">{JSON.stringify(babyMetrics, null, 2)}</pre></Card>}
    </div>
  );
}
