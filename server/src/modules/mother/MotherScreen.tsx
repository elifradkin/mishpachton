import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, SectionHeader, EmptyState } from '../../components/common';

export function MotherScreen() {
  const recovery = useDataStore(s => s.getRecovery());
  const motherMetrics = useDataStore(s => s.getMotherMetrics());
  const persons = useDataStore(s => s.getPersons());
  const mother = persons.find((p: any) => p.role === 'mother');
  const data = motherMetrics || recovery;
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-1">התאוששות אמא — {mother?.name || 'אמא'} 💜</h1>
      <p className="text-sage-500 text-sm mb-6">{mother?.status === 'postpartum' ? 'תקופת התאוששות אחרי לידה' : ''}</p>
      {data ? (
        <Card className="p-5"><SectionHeader title="נתוני התאוששות" /><pre className="text-xs text-sage-600 whitespace-pre-wrap" dir="rtl">{JSON.stringify(data, null, 2)}</pre></Card>
      ) : (
        <EmptyState title="אין נתוני התאוששות עדיין" description="נתונים יופיעו כשיתעדכנו בשרת" />
      )}
    </div>
  );
}
