import React, { useState, useMemo } from 'react';
import { t } from '../../i18n';
import { formatHebrewTime, formatHebrewDateTime, groupBy } from '../../utils';
import { TimelineRepository, PersonsRepository } from '../../layers/data-access/repositories';
import { Card, SectionHeader, Badge, Tabs, EmptyState } from '../../components/common';
import { Clock, Search, Baby, Moon, Droplets, Activity, Pill, Calendar, ListTodo, Bell, Star, FileText, Filter } from 'lucide-react';
import type { TimelineEventType } from '../../types/domain';

const typeIcons: Record<string, React.ReactNode> = {
  feeding: <Baby size={14} />,
  sleep: <Moon size={14} />,
  diaper: <Droplets size={14} />,
  health: <Activity size={14} />,
  medication: <Pill size={14} />,
  appointment: <Calendar size={14} />,
  task: <ListTodo size={14} />,
  reminder: <Bell size={14} />,
  alert: <Bell size={14} />,
  milestone: <Star size={14} />,
  note: <FileText size={14} />,
};

const typeColors: Record<string, string> = {
  feeding: 'bg-brand-100 text-brand-600',
  sleep: 'bg-sky-100 text-sky-600',
  diaper: 'bg-sage-100 text-sage-600',
  health: 'bg-rose-100 text-rose-500',
  medication: 'bg-sky-50 text-sky-500',
  appointment: 'bg-sky-100 text-sky-600',
  task: 'bg-brand-50 text-brand-500',
  milestone: 'bg-brand-100 text-brand-600',
};

const typeLabels: Record<string, string> = {
  feeding: 'האכלה',
  sleep: 'שינה',
  diaper: 'חיתול',
  health: 'בריאות',
  medication: 'תרופות',
  appointment: 'תור',
  task: 'משימה',
  reminder: 'תזכורת',
  milestone: 'אבן דרך',
};

const viewTabs = [
  { key: 'detailed', label: t('timeline.detailed') },
  { key: 'grouped', label: t('timeline.grouped') },
];

export function TimelineScreen() {
  const [viewMode, setViewMode] = useState('detailed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const allEvents = TimelineRepository.getAll();
  const persons = PersonsRepository.getAll();

  const filteredEvents = useMemo(() => {
    let events = allEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q) ||
        e.personName?.toLowerCase().includes(q)
      );
    }
    if (selectedPerson) {
      events = events.filter(e => e.personId === selectedPerson);
    }
    if (selectedType) {
      events = events.filter(e => e.type === selectedType);
    }
    return events;
  }, [allEvents, searchQuery, selectedPerson, selectedType]);

  const groupedEvents = useMemo(() => {
    return groupBy(filteredEvents, (e) => {
      const d = new Date(e.time);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'היום';
      const yesterday = new Date(today.getTime() - 86400000);
      if (d.toDateString() === yesterday.toDateString()) return 'אתמול';
      return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' });
    });
  }, [filteredEvents]);

  const eventTypes = [...new Set(allEvents.map(e => e.type))];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">{t('timeline.title')}</h1>
        <p className="text-sage-500 text-sm mt-0.5">{filteredEvents.length} אירועים</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400" />
        <input
          type="text"
          placeholder={t('timeline.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-sage-200 bg-white text-sage-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1 text-xs text-sage-500 ml-2">
          <Filter size={12} />
          {t('timeline.filterByPerson')}:
        </div>
        <button
          onClick={() => setSelectedPerson(null)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            !selectedPerson ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
          }`}
        >
          הכל
        </button>
        {persons.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPerson(selectedPerson === p.id ? null : p.id)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              selectedPerson === p.id ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1 text-xs text-sage-500 ml-2">
          <Filter size={12} />
          {t('timeline.filterByType')}:
        </div>
        <button
          onClick={() => setSelectedType(null)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            !selectedType ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
          }`}
        >
          הכל
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(selectedType === type ? null : type)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              selectedType === type ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
            }`}
          >
            {typeLabels[type] || type}
          </button>
        ))}
      </div>

      <Tabs tabs={viewTabs} activeTab={viewMode} onTabChange={setViewMode} className="mb-6" />

      {filteredEvents.length === 0 ? (
        <EmptyState title={t('timeline.noEvents')} icon={<Clock size={40} className="text-sage-300 mb-3" />} />
      ) : viewMode === 'grouped' ? (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([group, events]) => (
            <div key={group}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display font-bold text-sage-700 text-sm">{group}</span>
                <span className="text-xs text-sage-400">({events.length})</span>
                <div className="flex-1 h-px bg-sage-100" />
              </div>
              <div className="space-y-1.5">
                {events.map((event) => (
                  <TimelineRow key={event.id} event={event} compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute right-4 top-0 bottom-0 w-px bg-sage-100" />
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <TimelineRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineRow({ event, compact = false }: { event: (typeof TimelineRepository)['getAll'] extends () => (infer T)[] ? { id: string; type: string; personName?: string; time: string; title: string; subtitle?: string } : never; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'pr-8 py-2'}`}>
      {!compact && (
        <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[event.type] || 'bg-sage-100 text-sage-500'}`}>
          {typeIcons[event.type] || <Clock size={14} />}
        </div>
      )}
      <Card className={`flex-1 p-3 ${compact ? '!rounded-lg' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {compact && (
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${typeColors[event.type] || 'bg-sage-100 text-sage-500'}`}>
                {typeIcons[event.type] || <Clock size={10} />}
              </div>
            )}
            <span className="font-medium text-sage-800 text-sm">{event.title}</span>
            {event.subtitle && <span className="text-xs text-sage-400">{event.subtitle}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-sage-400">
            {event.personName && <span>{event.personName}</span>}
            <span>{formatHebrewTime(event.time)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
