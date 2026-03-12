import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, SectionHeader, Badge, EmptyState } from '../../components/common';
import { ListTodo } from 'lucide-react';

export function TasksScreen() {
  const tasks = useDataStore(s => s.getTasks());
  if (tasks.length === 0) return <div className="animate-fade-in"><h1 className="font-display font-bold text-2xl text-sage-900 mb-4">משימות</h1><EmptyState title="אין משימות" /></div>;
  const open = tasks.filter((t: any) => t.status === 'פעיל' || t.status === 'todo' || t.status === 'in_progress');
  const done = tasks.filter((t: any) => t.status === 'הושלם' || t.status === 'done');
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-1">משימות</h1>
      <p className="text-sage-500 text-sm mb-6">{open.length} משימות פעילות</p>
      {open.length > 0 && <><SectionHeader title="פעילות" /><div className="space-y-2 mb-6">{open.map((t: any) => (
        <Card key={t.id} className="p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sage-800 text-sm">{t.title}</p><p className="text-xs text-sage-400 mt-0.5">{t.category} {t.assigned_to ? `· ${t.assigned_to}` : ''}</p></div><Badge variant={t.priority === 'גבוהה' || t.priority === 'critical' ? 'warning' : 'default'}>{t.priority}</Badge></div>{t.notes && <p className="text-xs text-sage-400 mt-1">{t.notes}</p>}</Card>
      ))}</div></>}
      {done.length > 0 && <><SectionHeader title="הושלמו" /><div className="space-y-2">{done.map((t: any) => (
        <Card key={t.id} className="p-4 opacity-60"><p className="font-medium text-sage-800 text-sm line-through">{t.title}</p></Card>
      ))}</div></>}
    </div>
  );
}
