/**
 * Layer E — View Model / Adapter Layer
 * 
 * Converts domain data from repositories into UI-ready shapes
 * for specific screens. Screens consume these adapters rather
 * than raw repositories directly.
 */

import type {
  FeedingEvent, SleepEvent, DiaperEvent, FamilyTask,
  Appointment, AlertItem, TimelineEntry, ChartDataPoint,
  MotherDailySummary
} from '../../types/domain';
import { groupBy, getDayKey, formatDuration, formatHebrewTime } from '../../utils';
import { t } from '../../i18n';

// ─── Dashboard Cards Adapter ───
export interface DashboardCardVM {
  key: string;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
}

export function buildDashboardCards(data: {
  lastFeeding?: FeedingEvent;
  totalSleepMinutes: number;
  sleepSessions: number;
  diaperCount: number;
  diaperWet: number;
  diaperDirty: number;
  openTasks: number;
  overdueTasks: number;
}): DashboardCardVM[] {
  return [
    {
      key: 'last_feeding',
      label: t('dashboard.lastFeeding'),
      value: data.lastFeeding ? formatHebrewTime(data.lastFeeding.startTime) : '—',
      subtitle: data.lastFeeding ? t(`baby.feedingType.${data.lastFeeding.type}`) : undefined,
      color: 'text-amber-600',
      icon: 'baby',
    },
    {
      key: 'total_sleep',
      label: t('dashboard.totalSleep'),
      value: formatDuration(data.totalSleepMinutes),
      subtitle: `${data.sleepSessions} ${t('baby.sessions')}`,
      color: 'text-blue-600',
      icon: 'moon',
    },
    {
      key: 'diaper_count',
      label: t('dashboard.diaperCount'),
      value: data.diaperCount,
      subtitle: `${data.diaperWet} ${t('baby.diaperType.wet')} · ${data.diaperDirty} ${t('baby.diaperType.dirty')}`,
      color: 'text-green-700',
      icon: 'droplets',
    },
    {
      key: 'open_tasks',
      label: t('dashboard.openTasks'),
      value: data.openTasks,
      subtitle: data.overdueTasks > 0 ? `${data.overdueTasks} ${t('tasks.overdue')}` : undefined,
      color: data.overdueTasks > 0 ? 'text-red-500' : 'text-gray-700',
      icon: 'list',
    },
  ];
}

// ─── Feeding Chart Adapter ───
export interface FeedingChartVM {
  dailyCounts: ChartDataPoint[];
  byTypeBreakdown: { type: string; label: string; count: number; color: string }[];
  averagePerDay: number;
  totalToday: number;
}

export function buildFeedingChartVM(
  feedings: FeedingEvent[],
  chartData: ChartDataPoint[]
): FeedingChartVM {
  const typeColors: Record<string, string> = {
    breast_left: '#d97706',
    breast_right: '#f59e0b',
    bottle_breast_milk: '#2563eb',
    bottle_formula: '#7c3aed',
    solid: '#16a34a',
    supplement: '#64748b',
  };

  const typeCounts: Record<string, number> = {};
  feedings.forEach((f) => {
    typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
  });

  return {
    dailyCounts: chartData,
    byTypeBreakdown: Object.entries(typeCounts).map(([type, count]) => ({
      type,
      label: t(`baby.feedingType.${type}`),
      count,
      color: typeColors[type] || '#94a3b8',
    })),
    averagePerDay: chartData.length > 0
      ? chartData.reduce((s, d) => s + d.value, 0) / chartData.length
      : 0,
    totalToday: feedings.length,
  };
}

// ─── Sleep Chart Adapter ───
export interface SleepChartVM {
  dailyHours: ChartDataPoint[];
  averageHoursPerDay: number;
  totalTodayMinutes: number;
  sessionsToday: number;
}

export function buildSleepChartVM(
  sleeps: SleepEvent[],
  chartData: ChartDataPoint[]
): SleepChartVM {
  return {
    dailyHours: chartData,
    averageHoursPerDay: chartData.length > 0
      ? chartData.reduce((s, d) => s + d.value, 0) / chartData.length
      : 0,
    totalTodayMinutes: sleeps.reduce((s, sl) => s + (sl.durationMinutes || 0), 0),
    sessionsToday: sleeps.length,
  };
}

// ─── Task Board Adapter ───
export interface TaskBoardVM {
  columns: {
    key: string;
    label: string;
    tasks: FamilyTask[];
    count: number;
  }[];
  categoryGroups: { category: string; label: string; count: number }[];
  overdueCount: number;
}

export function buildTaskBoardVM(tasks: FamilyTask[]): TaskBoardVM {
  const statusOrder = ['todo', 'in_progress', 'done', 'cancelled'] as const;
  const statusLabels: Record<string, string> = {
    todo: t('tasks.todo'),
    in_progress: t('tasks.inProgress'),
    done: t('tasks.done'),
    cancelled: t('tasks.cancelled'),
  };

  const byStatus = groupBy(tasks, (task) => task.status);
  const columns = statusOrder.map((status) => ({
    key: status,
    label: statusLabels[status] || status,
    tasks: byStatus[status] || [],
    count: (byStatus[status] || []).length,
  }));

  const catCounts: Record<string, number> = {};
  tasks.forEach((task) => {
    catCounts[task.category] = (catCounts[task.category] || 0) + 1;
  });

  return {
    columns,
    categoryGroups: Object.entries(catCounts).map(([category, count]) => ({
      category,
      label: t(`tasks.category.${category}`),
      count,
    })),
    overdueCount: tasks.filter(
      (task) => task.status === 'todo' && task.dueDate && task.dueDate < new Date().toISOString()
    ).length,
  };
}

// ─── Timeline Grouping Adapter ───
export interface TimelineGroupVM {
  label: string;
  entries: TimelineEntry[];
}

export function buildTimelineGroups(entries: TimelineEntry[]): TimelineGroupVM[] {
  const grouped = groupBy(entries, (e) => {
    const d = new Date(e.time);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'היום';
    const yesterday = new Date(today.getTime() - 86400000);
    if (d.toDateString() === yesterday.toDateString()) return 'אתמול';
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' });
  });

  return Object.entries(grouped).map(([label, entries]) => ({ label, entries }));
}

// ─── Appointments Adapter ───
export interface UpcomingAppointmentVM {
  id: string;
  title: string;
  dateFormatted: string;
  timeFormatted: string;
  location?: string;
  provider?: string;
  personName?: string;
  typeLabel: string;
  statusLabel: string;
  hasPrepTasks: boolean;
  prepTaskCount: number;
}

export function buildUpcomingAppointments(
  appointments: Appointment[],
  personNames: Record<string, string>
): UpcomingAppointmentVM[] {
  return appointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    dateFormatted: new Date(apt.dateTime).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
    timeFormatted: formatHebrewTime(apt.dateTime),
    location: apt.location,
    provider: apt.provider,
    personName: personNames[apt.personId],
    typeLabel: t(`appointments.type.${apt.type}`),
    statusLabel: t(`appointments.status.${apt.status}`),
    hasPrepTasks: (apt.prepTasks?.length || 0) > 0,
    prepTaskCount: apt.prepTasks?.length || 0,
  }));
}

// ─── Mother Recovery Adapter ───
export interface MotherRecoverySummaryVM {
  hydrationPercent: number;
  hydrationLabel: string;
  supplementsTaken: string[];
  supplementsMissed: string[];
  moodDisplay: { value: number; max: number; emoji: string };
  energyDisplay: { value: number; max: number; emoji: string };
  sleepDisplay: string;
  symptoms: string[];
  hasSymptoms: boolean;
}

export function buildMotherRecoverySummary(daily: MotherDailySummary): MotherRecoverySummaryVM {
  const hydPct = (daily.hydrationGoal || 10) > 0
    ? (daily.hydrationGlasses || 0) / (daily.hydrationGoal || 10)
    : 0;

  return {
    hydrationPercent: Math.round(hydPct * 100),
    hydrationLabel: `${daily.hydrationGlasses || 0}/${daily.hydrationGoal || 10} ${t('mother.glasses')}`,
    supplementsTaken: daily.supplementsTaken || [],
    supplementsMissed: daily.supplementsMissed || [],
    moodDisplay: { value: daily.moodRating || 0, max: 5, emoji: '😊' },
    energyDisplay: { value: daily.energyRating || 0, max: 5, emoji: '⚡' },
    sleepDisplay: daily.sleepHours ? `${daily.sleepHours.toFixed(1)} ${t('baby.hours')}` : '—',
    symptoms: daily.symptoms || [],
    hasSymptoms: (daily.symptoms?.length || 0) > 0,
  };
}
