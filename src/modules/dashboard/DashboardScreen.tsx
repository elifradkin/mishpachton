import React from 'react';
import { t } from '../../i18n';
import { getGreeting, formatRelativeTime, formatDuration, formatHebrewDateTime } from '../../utils';
import { DashboardRepository, AlertsRepository, FeedingsRepository, AppointmentsRepository, TasksRepository } from '../../layers/data-access/repositories';
import { Card, StatCard, SectionHeader, Badge, Sparkline } from '../../components/common';
import { useAppStore } from '../../hooks/useAppStore';
import {
  Baby, Droplets, Moon, AlertTriangle, Calendar, ListTodo,
  Heart, RefreshCw, Clock, ChevronLeft, TrendingUp, Pill
} from 'lucide-react';

export function DashboardScreen() {
  const { syncStatus, lastSyncTime, triggerSync } = useAppStore();
  const summary = DashboardRepository.getTodaySummary();
  const alerts = AlertsRepository.getOpen();
  const lastFeeding = FeedingsRepository.getLast();
  const upcomingAppts = AppointmentsRepository.getUpcoming();
  const overdueTasks = TasksRepository.getOverdue();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-sage-900">{t(getGreeting())} ☀️</h1>
          <p className="text-sage-500 text-sm mt-0.5">{t('dashboard.todayOverview')}</p>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncStatus === 'syncing'}
          className="btn btn-ghost text-sage-500 hover:text-brand-500"
        >
          <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
          {syncStatus === 'syncing' ? t('sync.syncing') : t('settings.syncNow')}
        </button>
      </div>

      {/* Sync Status Bar */}
      {syncStatus === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-rose-600 text-sm mb-4">
          <AlertTriangle size={16} />
          <span>{t('errors.offlineMode')}</span>
          <span className="text-rose-400 mr-auto">{lastSyncTime ? formatRelativeTime(lastSyncTime) : ''}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('dashboard.lastFeeding')}
          value={lastFeeding ? formatRelativeTime(lastFeeding.startTime) : '—'}
          subtitle={lastFeeding ? t(`baby.feedingType.${lastFeeding.type}`) : undefined}
          icon={<Baby size={20} />}
          color="text-brand-600"
        />
        <StatCard
          label={t('dashboard.totalSleep')}
          value={formatDuration(summary.sleepTotalMinutes)}
          subtitle={`${summary.sleepSessions} ${t('baby.sessions')}`}
          icon={<Moon size={20} />}
          color="text-sky-600"
        />
        <StatCard
          label={t('dashboard.diaperCount')}
          value={summary.diaperCount}
          subtitle={`${summary.diaperWet} ${t('baby.diaperType.wet')} · ${summary.diaperDirty} ${t('baby.diaperType.dirty')}`}
          icon={<Droplets size={20} />}
          color="text-sage-700"
        />
        <StatCard
          label={t('dashboard.openTasks')}
          value={summary.openTasks}
          subtitle={summary.overdueTasks > 0 ? `${summary.overdueTasks} ${t('tasks.overdue')}` : undefined}
          icon={<ListTodo size={20} />}
          color={summary.overdueTasks > 0 ? 'text-rose-500' : 'text-sage-700'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div>
              <SectionHeader title={t('dashboard.openAlerts')} />
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-rose-100 text-rose-500' :
                        alert.severity === 'warning' ? 'bg-brand-100 text-brand-500' :
                        'bg-sky-100 text-sky-500'
                      }`}>
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sage-800 text-sm">{alert.title}</span>
                          <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
                            {t(`alerts.severity.${alert.severity}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-sage-500">{alert.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div>
              <SectionHeader title={`${t('tasks.overdue')} (${overdueTasks.length})`} />
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <Card key={task.id} className="p-4 border-r-4 border-r-rose-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sage-800 text-sm">{task.title}</p>
                        <p className="text-xs text-sage-400 mt-0.5">
                          {task.dueDate ? formatHebrewDateTime(task.dueDate) : ''}
                        </p>
                      </div>
                      <Badge variant="danger">{t(`tasks.priority.${task.priority}`)}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Mother Check-In */}
          {summary.motherCheckIn && (
            <div>
              <SectionHeader title={t('dashboard.motherCheckIn')} />
              <Card className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <p className="font-display font-bold text-lg text-sage-800">
                      {summary.motherCheckIn.hydrationGlasses}/{summary.motherCheckIn.hydrationGoal}
                    </p>
                    <p className="text-xs text-sage-400">{t('mother.glasses')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">😴</div>
                    <p className="font-display font-bold text-lg text-sage-800">
                      {summary.motherCheckIn.sleepHours?.toFixed(1)}
                    </p>
                    <p className="text-xs text-sage-400">{t('baby.hours')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">😊</div>
                    <p className="font-display font-bold text-lg text-sage-800">
                      {summary.motherCheckIn.moodRating}/5
                    </p>
                    <p className="text-xs text-sage-400">{t('mother.mood')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <p className="font-display font-bold text-lg text-sage-800">
                      {summary.motherCheckIn.energyRating}/5
                    </p>
                    <p className="text-xs text-sage-400">{t('mother.energy')}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: Appointments + Quick Metrics */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div>
            <SectionHeader title={t('dashboard.upcomingAppointments')} />
            {upcomingAppts.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-sage-400 text-center">{t('appointments.noAppointments')}</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingAppts.slice(0, 3).map((apt) => (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-500 flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sage-800 text-sm">{apt.title}</p>
                        <p className="text-xs text-sage-400 mt-0.5">{formatHebrewDateTime(apt.dateTime)}</p>
                        {apt.location && <p className="text-xs text-sage-400">{apt.location}</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sync Info */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-sage-400" />
              <span className="text-xs text-sage-500 font-medium">{t('dashboard.syncStatus')}</span>
            </div>
            <p className="text-sm text-sage-600">
              {lastSyncTime ? `${t('sync.lastSync')}: ${formatRelativeTime(lastSyncTime)}` : t('sync.never')}
            </p>
            <p className="text-xs text-sage-400 mt-1">
              {summary.isStale ? t('dashboard.staleWarning') : `${summary.feedingCount + summary.diaperCount + summary.sleepSessions} אירועים היום`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
