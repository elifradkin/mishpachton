import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, SectionHeader, Badge, EmptyState } from '../../components/common';
import { Calendar } from 'lucide-react';

export function AppointmentsScreen() {
  const appointments = useDataStore(s => s.getAppointments());
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-6">תורים 📅</h1>
      {appointments.length === 0 ? <EmptyState title="אין תורים" icon={<Calendar size={40} className="text-sage-300 mb-3" />} /> : (
        <div className="space-y-3">{appointments.map((a: any) => (
          <Card key={a.id} className="p-5">
            <p className="font-medium text-sage-800">{a.title}</p>
            <p className="text-xs text-sage-400 mt-1">{a.date_time || a.dateTime} · {a.location}</p>
            {a.provider && <p className="text-xs text-sage-400">{a.provider}</p>}
            <Badge variant={a.status === 'scheduled' || a.status === 'מתוכנן' ? 'info' : 'success'}>{a.status}</Badge>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
