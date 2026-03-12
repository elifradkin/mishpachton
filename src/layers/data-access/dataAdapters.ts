/**
 * Data Adapter Layer
 *
 * Normalizes raw server data (from OpenClaw) into the typed domain models
 * that the original UI components expect. This is the single translation
 * point between the server's JSON schemas and the app's domain types.
 *
 * The UI code should ONLY read from these adapters, never from raw server data.
 */

import { useDataStore } from './liveDataStore';
import type {
  Person, FeedingEvent, SleepEvent, DiaperEvent, HealthLog,
  MedicationLog, Appointment, FamilyTask, AlertItem,
  TimelineEntry, DashboardSummary, MotherDailySummary, MotherRecoveryMetrics,
  ChartDataPoint
} from '../../types/domain';

// ─── Person Adapter ───
function adaptPerson(raw: any): Person {
  const roleMap: Record<string, string> = { mother: 'mother', father: 'father', baby: 'baby', child: 'family_member', 'ילדה': 'family_member', 'ילד': 'family_member', 'תינוקת': 'baby', 'אמא': 'mother', 'אבא': 'father' };
  return {
    id: raw.id,
    name: raw.name || raw.name_en || raw.id,
    role: (roleMap[raw.role] || raw.role || 'family_member') as any,
    dateOfBirth: raw.date_of_birth,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at,
    metadata: { name_en: raw.name_en, age_years: raw.age_years, age_days: raw.age_days, status: raw.status },
  };
}

// ─── Feeding Adapter ───
function adaptFeeding(raw: any): FeedingEvent {
  const typeMap: Record<string, string> = { nursing: 'breast_left', bottle: 'bottle_formula', pumped: 'bottle_breast_milk' };
  return {
    id: raw.id,
    personId: raw.person_id,
    type: (typeMap[raw.type] || raw.type) as any,
    startTime: raw.timestamp || `${raw.date}T${raw.start_time || '00:00'}:00+02:00`,
    endTime: raw.end_time ? `${raw.date}T${raw.end_time}:00+02:00` : undefined,
    durationMinutes: raw.duration_min,
    amountMl: raw.amount_ml,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
    metadata: { type_he: raw.type_he, side_first: raw.side_first, formula_brand: raw.formula_brand, date: raw.date, start_time: raw.start_time },
  };
}

// ─── Sleep Adapter ───
function adaptSleep(raw: any): SleepEvent {
  return {
    id: raw.id,
    personId: raw.person_id,
    type: (raw.type === 'night_sleep' ? 'night_sleep' : 'nap') as any,
    startTime: `${raw.date}T${raw.start_time || '00:00'}:00+02:00`,
    endTime: raw.end_time ? `${raw.date}T${raw.end_time}:00+02:00` : undefined,
    durationMinutes: raw.duration_min,
    quality: raw.quality as any,
    location: raw.location,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

// ─── Diaper Adapter ───
function adaptDiaper(raw: any): DiaperEvent {
  const typeMap: Record<string, string> = { wet: 'wet', dirty: 'dirty', both: 'both', dry: 'dry' };
  return {
    id: raw.id,
    personId: raw.person_id,
    type: (typeMap[raw.type] || raw.type || 'wet') as any,
    time: `${raw.date}T${raw.time || '00:00'}:00+02:00`,
    consistency: raw.consistency as any,
    color: raw.color,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

// ─── Health Adapter ───
function adaptHealth(raw: any): HealthLog {
  return {
    id: raw.id,
    personId: raw.person_id,
    type: raw.type as any,
    time: `${raw.date}T${raw.time || '00:00'}:00+02:00`,
    value: raw.value,
    unit: raw.unit,
    description: raw.description,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

// ─── Medication Adapter ───
function adaptMedication(raw: any): MedicationLog {
  return {
    id: raw.id,
    personId: raw.person_id,
    name: raw.name,
    dosage: raw.dosage,
    frequency: raw.frequency as any,
    time: raw.date ? `${raw.date}T${raw.time || '00:00'}:00+02:00` : raw.created_at,
    taken: raw.taken ?? false,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

// ─── Task Adapter ───
function adaptTask(raw: any): FamilyTask {
  const statusMap: Record<string, string> = { 'פעיל': 'todo', active: 'todo', todo: 'todo', in_progress: 'in_progress', 'בתהליך': 'in_progress', done: 'done', 'הושלם': 'done', cancelled: 'cancelled', 'בוטל': 'cancelled' };
  const priMap: Record<string, string> = { 'קריטי': 'critical', critical: 'critical', 'גבוהה': 'high', high: 'high', 'בינונית': 'medium', medium: 'medium', 'נמוכה': 'low', low: 'low' };
  const catMap: Record<string, string> = { 'לוגיסטיקה': 'logistics', logistics: 'logistics', 'קניות': 'shopping', shopping: 'shopping', household: 'household', baby_care: 'baby_care', health: 'health', admin: 'admin', moving: 'moving', other: 'other' };
  return {
    id: raw.id,
    title: raw.title,
    description: raw.notes || raw.description,
    assigneeId: raw.assigned_to,
    priority: (priMap[raw.priority] || raw.priority || 'medium') as any,
    status: (statusMap[raw.status] || raw.status || 'todo') as any,
    category: (catMap[raw.category] || raw.category || 'other') as any,
    dueDate: raw.due_date,
    completedAt: raw.completed_at,
    tags: raw.tags,
    notes: raw.notes,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at,
  };
}

// ─── Appointment Adapter ───
function adaptAppointment(raw: any): Appointment {
  const statusMap: Record<string, string> = { scheduled: 'scheduled', 'מתוכנן': 'scheduled', completed: 'completed', 'הושלם': 'completed', cancelled: 'cancelled', missed: 'missed' };
  const typeMap: Record<string, string> = { checkup: 'checkup', 'בדיקה': 'checkup', vaccination: 'vaccination', 'חיסון': 'vaccination', specialist: 'specialist', emergency: 'emergency', other: 'other' };
  return {
    id: raw.id,
    personId: raw.person_id,
    title: raw.title,
    type: (typeMap[raw.type] || raw.type || 'other') as any,
    status: (statusMap[raw.status] || raw.status || 'scheduled') as any,
    dateTime: raw.date_time || raw.dateTime,
    location: raw.location,
    provider: raw.provider,
    prepTasks: raw.prep_tasks,
    summary: raw.summary,
    notes: raw.notes,
    documents: raw.documents,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

// ─── Alert Adapter ───
function adaptAlert(raw: any): AlertItem {
  return {
    id: raw.id,
    severity: (raw.severity || 'info') as any,
    title: raw.title_he || raw.title || '',
    message: raw.message_he || raw.message || '',
    category: raw.alert_type,
    dismissed: raw.dismissed ?? false,
    linkedEntityId: raw.person_id,
    createdAt: raw.timestamp || raw.created_at || new Date().toISOString(),
  };
}

// ─── Timeline Adapter ───
function adaptTimelineEntry(raw: any): TimelineEntry {
  const typeMap: Record<string, string> = { feeding: 'feeding', diaper: 'diaper', sleep: 'sleep', health: 'health', medication: 'medication', appointment: 'appointment', task: 'task' };
  return {
    id: raw.id || raw.source_id,
    type: (typeMap[raw.event_type] || raw.event_type || 'note') as any,
    personId: raw.person_id,
    personName: raw.person_name,
    time: raw.timestamp || `${raw.date}T${raw.time || '00:00'}:00+02:00`,
    title: raw.title_he || raw.title || '',
    subtitle: raw.subtitle_he || raw.subtitle,
    icon: raw.icon,
  };
}

// ─── Dashboard Summary Adapter ───
function buildDashboard(store: ReturnType<typeof useDataStore.getState>): DashboardSummary {
  const dashboard = store.getDashboard();
  const feedings = store.getFeedings();
  const diapers = store.getDiapers();
  const sleepLog = store.getSleep();
  const tasks = store.getTasks();
  const alerts = store.getAlerts();
  const appointments = store.getAppointments();
  const recovery = store.getRecovery();

  const adaptedFeedings = feedings.map(adaptFeeding);
  const adaptedAlerts = alerts.map(adaptAlert);
  const adaptedAppointments = appointments.map(adaptAppointment).filter((a: Appointment) => a.status === 'scheduled');
  const adaptedTasks = tasks.map(adaptTask);
  const openTasks = adaptedTasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const overdueTasks = adaptedTasks.filter(t => t.status === 'todo' && t.dueDate && t.dueDate < new Date().toISOString());

  const totalSleepMin = sleepLog.reduce((s: number, x: any) => s + (x.duration_min || 0), 0);
  const lastFeeding = adaptedFeedings.length > 0 ? adaptedFeedings[adaptedFeedings.length - 1] : undefined;

  // Mother recovery
  let motherCheckIn: MotherDailySummary | undefined;
  const recoveryLog = recovery?.recovery_log || recovery?.daily_summaries;
  if (recoveryLog && recoveryLog.length > 0) {
    const latest = recoveryLog[recoveryLog.length - 1];
    motherCheckIn = {
      date: latest.date,
      hydrationGlasses: latest.hydration_glasses,
      hydrationGoal: latest.hydration_goal,
      supplementsTaken: latest.supplements_taken,
      supplementsMissed: latest.supplements_missed,
      symptoms: latest.symptoms,
      sleepHours: latest.sleep_hours,
      sleepQuality: latest.sleep_quality,
      moodRating: latest.mood_rating,
      energyRating: latest.energy_rating,
      notes: latest.notes,
    };
  }

  return {
    date: new Date().toISOString().split('T')[0],
    feedingCount: feedings.length,
    feedingTotalMl: feedings.reduce((s: number, f: any) => s + (f.amount_ml || 0), 0),
    lastFeedingTime: lastFeeding?.startTime,
    lastFeedingType: lastFeeding?.type,
    sleepTotalMinutes: totalSleepMin,
    sleepSessions: sleepLog.length,
    diaperCount: diapers.length,
    diaperWet: diapers.filter((d: any) => d.type === 'wet' || d.type === 'both').length,
    diaperDirty: diapers.filter((d: any) => d.type === 'dirty' || d.type === 'both').length,
    openAlerts: adaptedAlerts.filter(a => !a.dismissed),
    upcomingAppointments: adaptedAppointments,
    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
    motherCheckIn,
    lastSyncTime: store.lastFetchTime || undefined,
    isStale: !store.isBackendOnline,
  };
}

// ─── Mother Recovery Metrics Adapter ───
function buildMotherMetrics(store: ReturnType<typeof useDataStore.getState>): MotherRecoveryMetrics {
  const recovery = store.getRecovery();
  const motherMetrics = store.getMotherMetrics();
  const recoveryLog = recovery?.recovery_log || recovery?.daily_summaries || [];

  const dailySummaries: MotherDailySummary[] = recoveryLog.map((r: any) => ({
    date: r.date,
    hydrationGlasses: r.hydration_glasses,
    hydrationGoal: r.hydration_goal || 10,
    supplementsTaken: r.supplements_taken,
    supplementsMissed: r.supplements_missed,
    symptoms: r.symptoms,
    sleepHours: r.sleep_hours,
    sleepQuality: r.sleep_quality,
    moodRating: r.mood_rating,
    energyRating: r.energy_rating,
    notes: r.notes,
  }));

  const withSleep = dailySummaries.filter(d => d.sleepHours != null && d.sleepHours > 0);
  const withMood = dailySummaries.filter(d => d.moodRating != null);
  const withEnergy = dailySummaries.filter(d => d.energyRating != null);

  // Use server metrics if available
  const mMetrics = motherMetrics?.metrics;
  const hydAdherence = mMetrics?.hydration?.adherence_percent != null ? mMetrics.hydration.adherence_percent / 100 : (dailySummaries.length > 0 ? dailySummaries.reduce((s, d) => s + ((d.hydrationGlasses || 0) / (d.hydrationGoal || 10)), 0) / dailySummaries.length : 0);
  const supAdherence = mMetrics?.supplements?.adherence_percent != null ? mMetrics.supplements.adherence_percent / 100 : 0.85;

  const symptomFreq: Record<string, number> = {};
  dailySummaries.forEach(d => {
    (d.symptoms || []).forEach(s => { symptomFreq[s] = (symptomFreq[s] || 0) + 1; });
  });

  return {
    dailySummaries,
    averageSleepHours: withSleep.length > 0 ? withSleep.reduce((s, d) => s + (d.sleepHours || 0), 0) / withSleep.length : 0,
    averageMoodRating: withMood.length > 0 ? withMood.reduce((s, d) => s + (d.moodRating || 0), 0) / withMood.length : 0,
    averageEnergyRating: withEnergy.length > 0 ? withEnergy.reduce((s, d) => s + (d.energyRating || 0), 0) / withEnergy.length : 0,
    hydrationAdherence: hydAdherence,
    supplementAdherence: supAdherence,
    symptomFrequency: symptomFreq,
  };
}

// ─── Chart Data Builder ───
function buildFeedingChart(store: ReturnType<typeof useDataStore.getState>): ChartDataPoint[] {
  const dashboard = store.getDashboard();
  const feedings = store.getFeedings();

  // Use server chart_series if available
  if (dashboard?.chart_series?.feedings_24h) {
    return dashboard.chart_series.feedings_24h.map((d: any) => ({
      date: d.hour,
      value: d.count,
      label: d.type,
    }));
  }

  // Build from raw data grouped by date
  const byDate: Record<string, number> = {};
  feedings.forEach((f: any) => {
    const date = f.date || 'unknown';
    byDate[date] = (byDate[date] || 0) + 1;
  });
  return Object.entries(byDate).map(([date, count]) => ({ date, value: count }));
}

// ═══════════════════════════════════════════════════════
// PUBLIC HOOKS — used by UI components
// ═══════════════════════════════════════════════════════

export function useAdaptedPersons(): Person[] {
  const raw = useDataStore(s => s.getPersons());
  return raw.map(adaptPerson);
}

export function useAdaptedFeedings(): FeedingEvent[] {
  const raw = useDataStore(s => s.getFeedings());
  return raw.map(adaptFeeding);
}

export function useAdaptedSleeps(): SleepEvent[] {
  const raw = useDataStore(s => s.getSleep());
  return raw.map(adaptSleep);
}

export function useAdaptedDiapers(): DiaperEvent[] {
  const raw = useDataStore(s => s.getDiapers());
  return raw.map(adaptDiaper);
}

export function useAdaptedHealthLogs(): HealthLog[] {
  const raw = useDataStore(s => s.getHealth());
  const logs = raw?.health_log || raw?.health_logs || [];
  return logs.map(adaptHealth);
}

export function useAdaptedMedications(): MedicationLog[] {
  const rawStore = useDataStore.getState();
  const normalized = rawStore.raw;
  const meds = (normalized as any)?.normalized_medications?.medications || [];
  return meds.map(adaptMedication);
}

export function useAdaptedTasks(): FamilyTask[] {
  const raw = useDataStore(s => s.getTasks());
  return raw.map(adaptTask);
}

export function useAdaptedAppointments(): Appointment[] {
  const raw = useDataStore(s => s.getAppointments());
  return raw.map(adaptAppointment);
}

export function useAdaptedAlerts(): AlertItem[] {
  const raw = useDataStore(s => s.getAlerts());
  return raw.map(adaptAlert);
}

export function useAdaptedTimeline(): TimelineEntry[] {
  const raw = useDataStore(s => s.getTimeline());
  if (raw.length > 0) return raw.map(adaptTimelineEntry);

  // Build from raw data if no derived timeline
  const feedings = useDataStore(s => s.getFeedings());
  const diapers = useDataStore(s => s.getDiapers());
  const sleepLog = useDataStore(s => s.getSleep());
  const entries: TimelineEntry[] = [
    ...feedings.map((f: any) => adaptTimelineEntry({ id: f.id, event_type: 'feeding', person_id: f.person_id, person_name: 'ליה', timestamp: f.timestamp || `${f.date}T${f.start_time}:00+02:00`, date: f.date, time: f.start_time, title_he: f.type_he || f.type, subtitle_he: f.amount_ml ? `${f.amount_ml} מ״ל` : f.duration_min ? `${f.duration_min} דק׳` : '', icon: '🍼' })),
    ...diapers.map((d: any) => adaptTimelineEntry({ id: d.id, event_type: 'diaper', person_id: d.person_id, person_name: 'ליה', timestamp: `${d.date}T${d.time}:00+02:00`, date: d.date, time: d.time, title_he: d.type_he || d.type, subtitle_he: '', icon: '🧷' })),
    ...sleepLog.map((s: any) => adaptTimelineEntry({ id: s.id, event_type: 'sleep', person_id: s.person_id, person_name: 'ליה', timestamp: `${s.date}T${s.start_time}:00+02:00`, date: s.date, time: s.start_time, title_he: s.type_he || 'שינה', subtitle_he: s.duration_min ? `${s.duration_min} דק׳` : '', icon: '😴' })),
  ];
  return entries.sort((a, b) => b.time.localeCompare(a.time));
}

export function useAdaptedDashboard(): DashboardSummary {
  const store = useDataStore.getState();
  return buildDashboard(store);
}

export function useAdaptedMotherMetrics(): MotherRecoveryMetrics {
  const store = useDataStore.getState();
  return buildMotherMetrics(store);
}

export function useDashboardCards(): any[] {
  const dashboard = useDataStore(s => s.getDashboard());
  return dashboard?.summary_cards || [];
}

export function useFeedingChartData(): ChartDataPoint[] {
  const store = useDataStore.getState();
  return buildFeedingChart(store);
}

export function useBabyMetrics(): any {
  const m = useDataStore(s => s.getBabyMetrics());
  // Support both nested and flat formats
  if (m?.metrics) return m.metrics;
  // Convert flat to nested
  if (m?.feedings_count != null) {
    return {
      feeding: {
        total_count: m.feedings_count,
        total_bottle_ml: m.feedings_ml_total,
        total_nursing_minutes: m.feedings_breast_minutes,
      },
      diapers: {
        total_count: m.diapers_count,
        wet_count: m.diapers_urine_count,
        dirty_count: m.diapers_stool_count,
      },
      sleep: {
        total_naps: m.sleeps_count,
        total_sleep_minutes: m.sleep_total_minutes,
      },
    };
  }
  return null;
}

export function useBaby(): (Person & { ageDays?: number }) | undefined {
  const persons = useAdaptedPersons();
  const baby = persons.find(p => p.role === 'baby');
  if (baby && baby.metadata) {
    return { ...baby, ageDays: (baby.metadata as any).age_days };
  }
  return baby as any;
}

export function useMother(): Person | undefined {
  const persons = useAdaptedPersons();
  return persons.find(p => p.role === 'mother');
}
