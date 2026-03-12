/**
 * Mock Data Provider
 * 
 * In production, this would be replaced by the cache layer reading from
 * synced local files. For now, it provides realistic demo data.
 */
import type {
  Person, FeedingEvent, SleepEvent, DiaperEvent, HealthLog,
  MedicationLog, Appointment, FamilyTask, AlertItem, Reminder,
  TimelineEntry, DashboardSummary, MotherDailySummary, MotherRecoveryMetrics,
  ChartDataPoint, LatestState, SyncState, SyncLogEntry
} from '../../types/domain';

const NOW = new Date();
const TODAY = NOW.toISOString().split('T')[0];

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(NOW.getTime() - d * 86400000).toISOString();
}
function daysAgoDate(d: number): string {
  return new Date(NOW.getTime() - d * 86400000).toISOString().split('T')[0];
}
function futureHours(h: number): string {
  return new Date(NOW.getTime() + h * 3600000).toISOString();
}
function futureDays(d: number): string {
  return new Date(NOW.getTime() + d * 86400000).toISOString();
}

// --- Persons ---
export const mockPersons: Person[] = [
  { id: 'baby-1', name: 'נועם', role: 'baby', dateOfBirth: daysAgo(45), createdAt: daysAgo(45) },
  { id: 'mother-1', name: 'שירה', role: 'mother', dateOfBirth: '1993-05-14T00:00:00Z', createdAt: daysAgo(365) },
  { id: 'father-1', name: 'אדם', role: 'father', dateOfBirth: '1991-11-22T00:00:00Z', createdAt: daysAgo(365) },
];

// --- Feedings ---
export const mockFeedings: FeedingEvent[] = [
  { id: 'f-1', personId: 'baby-1', type: 'breast_right', startTime: hoursAgo(1.5), durationMinutes: 18, createdAt: hoursAgo(1.5) },
  { id: 'f-2', personId: 'baby-1', type: 'breast_left', startTime: hoursAgo(4), durationMinutes: 22, createdAt: hoursAgo(4) },
  { id: 'f-3', personId: 'baby-1', type: 'bottle_breast_milk', startTime: hoursAgo(7), amountMl: 90, durationMinutes: 15, createdAt: hoursAgo(7) },
  { id: 'f-4', personId: 'baby-1', type: 'breast_right', startTime: hoursAgo(10), durationMinutes: 20, createdAt: hoursAgo(10) },
  { id: 'f-5', personId: 'baby-1', type: 'breast_left', startTime: hoursAgo(13), durationMinutes: 25, createdAt: hoursAgo(13) },
  { id: 'f-6', personId: 'baby-1', type: 'bottle_formula', startTime: hoursAgo(16), amountMl: 60, durationMinutes: 12, createdAt: hoursAgo(16) },
  { id: 'f-7', personId: 'baby-1', type: 'breast_right', startTime: hoursAgo(19), durationMinutes: 15, createdAt: hoursAgo(19) },
  { id: 'f-8', personId: 'baby-1', type: 'breast_left', startTime: hoursAgo(22), durationMinutes: 20, createdAt: hoursAgo(22) },
];

// --- Sleeps ---
export const mockSleeps: SleepEvent[] = [
  { id: 's-1', personId: 'baby-1', type: 'nap', startTime: hoursAgo(2), endTime: hoursAgo(1), durationMinutes: 60, quality: 'good', createdAt: hoursAgo(2) },
  { id: 's-2', personId: 'baby-1', type: 'nap', startTime: hoursAgo(5.5), endTime: hoursAgo(4.5), durationMinutes: 60, quality: 'fair', createdAt: hoursAgo(5.5) },
  { id: 's-3', personId: 'baby-1', type: 'night_sleep', startTime: hoursAgo(14), endTime: hoursAgo(10), durationMinutes: 240, quality: 'good', createdAt: hoursAgo(14) },
  { id: 's-4', personId: 'baby-1', type: 'nap', startTime: hoursAgo(18), endTime: hoursAgo(17), durationMinutes: 60, quality: 'fair', createdAt: hoursAgo(18) },
];

// --- Diapers ---
export const mockDiapers: DiaperEvent[] = [
  { id: 'd-1', personId: 'baby-1', type: 'wet', time: hoursAgo(1), createdAt: hoursAgo(1) },
  { id: 'd-2', personId: 'baby-1', type: 'both', time: hoursAgo(3), consistency: 'normal', createdAt: hoursAgo(3) },
  { id: 'd-3', personId: 'baby-1', type: 'wet', time: hoursAgo(5), createdAt: hoursAgo(5) },
  { id: 'd-4', personId: 'baby-1', type: 'dirty', time: hoursAgo(8), consistency: 'normal', createdAt: hoursAgo(8) },
  { id: 'd-5', personId: 'baby-1', type: 'wet', time: hoursAgo(11), createdAt: hoursAgo(11) },
  { id: 'd-6', personId: 'baby-1', type: 'both', time: hoursAgo(15), consistency: 'loose', createdAt: hoursAgo(15) },
  { id: 'd-7', personId: 'baby-1', type: 'wet', time: hoursAgo(20), createdAt: hoursAgo(20) },
];

// --- Health Logs ---
export const mockHealthLogs: HealthLog[] = [
  { id: 'h-1', personId: 'baby-1', type: 'weight', time: daysAgo(2), value: 3.8, unit: 'kg', createdAt: daysAgo(2) },
  { id: 'h-2', personId: 'baby-1', type: 'weight', time: daysAgo(14), value: 3.5, unit: 'kg', createdAt: daysAgo(14) },
  { id: 'h-3', personId: 'baby-1', type: 'weight', time: daysAgo(30), value: 3.2, unit: 'kg', createdAt: daysAgo(30) },
  { id: 'h-4', personId: 'baby-1', type: 'temperature', time: hoursAgo(6), value: 36.8, unit: '°C', createdAt: hoursAgo(6) },
  { id: 'h-5', personId: 'baby-1', type: 'milestone', time: daysAgo(5), description: 'חיוך ראשון', createdAt: daysAgo(5) },
  { id: 'h-6', personId: 'baby-1', type: 'height', time: daysAgo(2), value: 53, unit: 'ס״מ', createdAt: daysAgo(2) },
];

// --- Medications ---
export const mockMedications: MedicationLog[] = [
  { id: 'm-1', personId: 'baby-1', name: 'ויטמין D', dosage: '400 IU', frequency: 'daily', time: hoursAgo(3), taken: true, createdAt: hoursAgo(3) },
  { id: 'm-2', personId: 'baby-1', name: 'ויטמין D', dosage: '400 IU', frequency: 'daily', time: daysAgo(1), taken: true, createdAt: daysAgo(1) },
  { id: 'm-3', personId: 'mother-1', name: 'ברזל', dosage: '27mg', frequency: 'daily', time: hoursAgo(2), taken: true, createdAt: hoursAgo(2) },
  { id: 'm-4', personId: 'mother-1', name: 'אומגה 3', dosage: '1000mg', frequency: 'daily', time: hoursAgo(2), taken: false, createdAt: hoursAgo(2) },
];

// --- Appointments ---
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1', personId: 'baby-1', title: 'ביקור חודש וחצי בטיפת חלב',
    type: 'checkup', status: 'scheduled', dateTime: futureHours(48),
    location: 'טיפת חלב — רחובות', provider: 'אחות תמר',
    prepTasks: ['להביא פנקס חיסונים', 'להכין שאלות'],
    createdAt: daysAgo(10),
  },
  {
    id: 'apt-2', personId: 'mother-1', title: 'בדיקת 6 שבועות אצל רופאת נשים',
    type: 'checkup', status: 'scheduled', dateTime: futureDays(5),
    location: 'מרפאת כללית — רחובות', provider: 'ד״ר לוי',
    createdAt: daysAgo(20),
  },
  {
    id: 'apt-3', personId: 'baby-1', title: 'בדיקת שמיעה',
    type: 'specialist', status: 'completed', dateTime: daysAgo(10),
    location: 'קפלן', provider: 'מרכז שמיעה',
    summary: 'שמיעה תקינה בשתי האוזניים', createdAt: daysAgo(30),
  },
];

// --- Tasks ---
export const mockTasks: FamilyTask[] = [
  { id: 't-1', title: 'לקנות חיתולים מידה 2', priority: 'high', status: 'todo', category: 'shopping', assigneeId: 'father-1', dueDate: futureDays(1), createdAt: daysAgo(2) },
  { id: 't-2', title: 'לתאם ביקור סבתא', priority: 'medium', status: 'in_progress', category: 'logistics', assigneeId: 'mother-1', createdAt: daysAgo(3) },
  { id: 't-3', title: 'לסדר ארון בגדי תינוק', priority: 'low', status: 'todo', category: 'household', assigneeId: 'father-1', dueDate: futureDays(7), createdAt: daysAgo(5) },
  { id: 't-4', title: 'להזמין כיסא בטיחות', priority: 'critical', status: 'todo', category: 'shopping', assigneeId: 'father-1', dueDate: daysAgo(1), createdAt: daysAgo(10) },
  { id: 't-5', title: 'לעדכן ביטוח בריאות', priority: 'high', status: 'todo', category: 'admin', dueDate: futureDays(3), createdAt: daysAgo(7) },
  { id: 't-6', title: 'הזמנת צילום ניובורן', priority: 'medium', status: 'done', category: 'logistics', assigneeId: 'mother-1', completedAt: daysAgo(2), createdAt: daysAgo(14) },
  { id: 't-7', title: 'לחדש חניה', priority: 'low', status: 'done', category: 'admin', assigneeId: 'father-1', completedAt: daysAgo(1), createdAt: daysAgo(5) },
  { id: 't-8', title: 'ארגון מעבר דירה — אריזת מטבח', priority: 'high', status: 'in_progress', category: 'moving', assigneeId: 'father-1', dueDate: futureDays(14), createdAt: daysAgo(7) },
];

// --- Alerts ---
export const mockAlerts: AlertItem[] = [
  { id: 'al-1', severity: 'warning', title: 'משימה באיחור', message: 'הזמנת כיסא בטיחות — עבר מועד יעד', dismissed: false, linkedEntityId: 't-4', createdAt: daysAgo(1) },
  { id: 'al-2', severity: 'info', title: 'תור קרוב', message: 'ביקור חודש וחצי בטיפת חלב בעוד יומיים', dismissed: false, linkedEntityId: 'apt-1', createdAt: hoursAgo(2) },
  { id: 'al-3', severity: 'critical', title: 'תוסף לא נלקח', message: 'אומגה 3 — שירה לא לקחה היום', dismissed: false, linkedEntityId: 'm-4', createdAt: hoursAgo(1) },
];

// --- Mother Recovery ---
export const mockMotherDailySummaries: MotherDailySummary[] = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgoDate(i),
  hydrationGlasses: Math.floor(Math.random() * 4) + 5,
  hydrationGoal: 10,
  supplementsTaken: ['ברזל', 'ויטמין D', 'סידן'].slice(0, Math.floor(Math.random() * 3) + 1),
  supplementsMissed: Math.random() > 0.6 ? ['אומגה 3'] : [],
  symptoms: Math.random() > 0.7 ? ['עייפות'] : [],
  sleepHours: 4 + Math.random() * 3,
  sleepQuality: (['good', 'fair', 'poor'] as const)[Math.floor(Math.random() * 3)],
  moodRating: Math.floor(Math.random() * 3) + 3,
  energyRating: Math.floor(Math.random() * 3) + 2,
}));

export const mockMotherRecoveryMetrics: MotherRecoveryMetrics = {
  dailySummaries: mockMotherDailySummaries,
  averageSleepHours: 5.8,
  averageMoodRating: 3.7,
  averageEnergyRating: 3.2,
  hydrationAdherence: 0.72,
  supplementAdherence: 0.85,
  symptomFrequency: { 'עייפות': 8, 'כאבי גב': 3, 'כאבי ראש': 2 },
};

// --- Chart Data ---
function generateChartData(days: number, minVal: number, maxVal: number): ChartDataPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: daysAgoDate(days - 1 - i),
    value: Math.round(minVal + Math.random() * (maxVal - minVal)),
  }));
}

export const mockFeedingChart: ChartDataPoint[] = generateChartData(14, 6, 10);
export const mockSleepChart: ChartDataPoint[] = generateChartData(14, 280, 420).map(d => ({ ...d, value: Math.round(d.value / 60 * 10) / 10 }));
export const mockDiaperChart: ChartDataPoint[] = generateChartData(14, 5, 9);

// --- Dashboard Summary ---
export const mockDashboardSummary: DashboardSummary = {
  date: TODAY,
  feedingCount: mockFeedings.length,
  feedingTotalMl: 150,
  lastFeedingTime: mockFeedings[0]?.startTime,
  lastFeedingType: mockFeedings[0]?.type,
  sleepTotalMinutes: mockSleeps.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
  sleepSessions: mockSleeps.length,
  diaperCount: mockDiapers.length,
  diaperWet: mockDiapers.filter(d => d.type === 'wet' || d.type === 'both').length,
  diaperDirty: mockDiapers.filter(d => d.type === 'dirty' || d.type === 'both').length,
  openAlerts: mockAlerts.filter(a => !a.dismissed),
  upcomingAppointments: mockAppointments.filter(a => a.status === 'scheduled'),
  openTasks: mockTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length,
  overdueTasks: mockTasks.filter(t => t.status === 'todo' && t.dueDate && t.dueDate < NOW.toISOString()).length,
  motherCheckIn: mockMotherDailySummaries[0],
  lastSyncTime: hoursAgo(0.5),
  isStale: false,
};

// --- Timeline ---
export const mockTimeline: TimelineEntry[] = [
  ...mockFeedings.map(f => ({ id: f.id, type: 'feeding' as const, personId: f.personId, personName: 'נועם', time: f.startTime, title: 'האכלה', subtitle: `${f.durationMinutes} דק׳` })),
  ...mockSleeps.map(s => ({ id: s.id, type: 'sleep' as const, personId: s.personId, personName: 'נועם', time: s.startTime, title: 'שינה', subtitle: `${s.durationMinutes} דק׳` })),
  ...mockDiapers.map(d => ({ id: d.id, type: 'diaper' as const, personId: d.personId, personName: 'נועם', time: d.time, title: 'חיתול', subtitle: d.type })),
].sort((a, b) => b.time.localeCompare(a.time));

// --- Sync State ---
export const mockSyncState: SyncState = {
  status: 'success',
  lastSyncTime: hoursAgo(0.5),
  lastSuccessTime: hoursAgo(0.5),
  lastError: null,
  filesUpdated: 12,
  isAutoSyncEnabled: true,
};

export const mockSyncLog: SyncLogEntry[] = [
  { timestamp: hoursAgo(0.5), action: 'full_sync', status: 'success', message: 'סנכרון מלא הושלם — 12 קבצים עודכנו' },
  { timestamp: hoursAgo(6), action: 'full_sync', status: 'success', message: 'סנכרון מלא הושלם — 8 קבצים עודכנו' },
  { timestamp: daysAgo(1), action: 'full_sync', status: 'warning', message: 'סנכרון חלקי — 3 קבצים לא נמצאו' },
  { timestamp: daysAgo(2), action: 'full_sync', status: 'error', message: 'שגיאת חיבור לשרת — timeout' },
];
