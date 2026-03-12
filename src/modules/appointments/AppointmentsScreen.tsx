import React, { useState } from 'react';
import { t } from '../../i18n';
import { formatHebrewDateTime, formatHebrewDate } from '../../utils';
import { AppointmentsRepository, PersonsRepository } from '../../layers/data-access/repositories';
import { Card, SectionHeader, Badge, Tabs, EmptyState } from '../../components/common';
import { Calendar, MapPin, User, FileText, CheckSquare, Clock } from 'lucide-react';

const tabs = [
  { key: 'upcoming', label: t('appointments.upcoming') },
  { key: 'past', label: t('appointments.past') },
];

export function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const upcoming = AppointmentsRepository.getUpcoming();
  const past = AppointmentsRepository.getPast();
  const persons = PersonsRepository.getAll();
  const personMap: Record<string, string> = {};
  persons.forEach(p => { personMap[p.id] = p.name; });

  const appointments = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">{t('appointments.title')}</h1>
        <p className="text-sage-500 text-sm mt-0.5">{upcoming.length} תורים קרובים</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {appointments.length === 0 ? (
        <EmptyState title={t('appointments.noAppointments')} icon={<Calendar size={40} className="text-sage-300 mb-3" />} />
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id} className={`p-5 ${apt.status === 'completed' ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Date Badge */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  apt.status === 'scheduled' ? 'bg-sky-50 text-sky-600' :
                  apt.status === 'completed' ? 'bg-sage-50 text-sage-500' :
                  'bg-rose-50 text-rose-500'
                }`}>
                  <span className="font-display font-bold text-lg leading-none">
                    {new Date(apt.dateTime).getDate()}
                  </span>
                  <span className="text-[10px] font-medium">
                    {new Date(apt.dateTime).toLocaleDateString('he-IL', { month: 'short' })}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sage-800">{apt.title}</span>
                    <Badge variant={
                      apt.status === 'scheduled' ? 'info' :
                      apt.status === 'completed' ? 'success' :
                      'danger'
                    }>
                      {t(`appointments.status.${apt.status}`)}
                    </Badge>
                    <Badge>{t(`appointments.type.${apt.type}`)}</Badge>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-sage-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatHebrewDateTime(apt.dateTime)}
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {apt.location}
                      </span>
                    )}
                    {apt.provider && (
                      <span className="flex items-center gap-1">
                        <User size={12} /> {apt.provider}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size={12} /> {personMap[apt.personId] || ''}
                    </span>
                  </div>

                  {/* Prep Tasks */}
                  {apt.prepTasks && apt.prepTasks.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-sage-500 font-medium mb-1">{t('appointments.prepTasks')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {apt.prepTasks.map((task, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-sage-50 text-sage-600 px-2 py-0.5 rounded">
                            <CheckSquare size={10} /> {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {apt.summary && (
                    <div className="bg-sage-50 rounded-lg px-3 py-2 text-sm text-sage-600">
                      <span className="font-medium">{t('appointments.summary')}: </span>
                      {apt.summary}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
