/**
 * Data Access Layer — Repositories
 * 
 * All UI data access goes through these repositories.
 * In production, they read from the local cache.
 * Currently backed by mock data.
 */
import type {
  Person, FeedingEvent, SleepEvent, DiaperEvent, HealthLog,
  MedicationLog, Appointment, FamilyTask, AlertItem, Reminder,
  TimelineEntry, DashboardSummary, MotherRecoveryMetrics,
  ChartDataPoint, SyncState, SyncLogEntry
} from '../../types/domain';
import {
  mockPersons, mockFeedings, mockSleeps, mockDiapers, mockHealthLogs,
  mockMedications, mockAppointments, mockTasks, mockAlerts,
  mockTimeline, mockDashboardSummary, mockMotherRecoveryMetrics,
  mockFeedingChart, mockSleepChart, mockDiaperChart,
  mockSyncState, mockSyncLog
} from './mockData';
import { sortByDate } from '../../utils';

// --- Person ---
export const PersonsRepository = {
  getAll: (): Person[] => mockPersons,
  getById: (id: string): Person | undefined => mockPersons.find(p => p.id === id),
  getByRole: (role: string): Person[] => mockPersons.filter(p => p.role === role),
  getBaby: (): Person | undefined => mockPersons.find(p => p.role === 'baby'),
  getMother: (): Person | undefined => mockPersons.find(p => p.role === 'mother'),
};

// --- Feeding ---
export const FeedingsRepository = {
  getAll: (): FeedingEvent[] => sortByDate(mockFeedings, 'startTime'),
  getByPerson: (personId: string): FeedingEvent[] =>
    sortByDate(mockFeedings.filter(f => f.personId === personId), 'startTime'),
  getToday: (): FeedingEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return sortByDate(
      mockFeedings.filter(f => f.startTime.startsWith(today)),
      'startTime'
    );
  },
  getLast: (): FeedingEvent | undefined => sortByDate(mockFeedings, 'startTime')[0],
  getByDateRange: (start: string, end: string): FeedingEvent[] =>
    sortByDate(mockFeedings.filter(f => f.startTime >= start && f.startTime <= end), 'startTime'),
};

// --- Sleep ---
export const SleepsRepository = {
  getAll: (): SleepEvent[] => sortByDate(mockSleeps, 'startTime'),
  getByPerson: (personId: string): SleepEvent[] =>
    sortByDate(mockSleeps.filter(s => s.personId === personId), 'startTime'),
  getToday: (): SleepEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return sortByDate(
      mockSleeps.filter(s => s.startTime.startsWith(today)),
      'startTime'
    );
  },
  getTotalTodayMinutes: (): number =>
    mockSleeps.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
};

// --- Diaper ---
export const DiapersRepository = {
  getAll: (): DiaperEvent[] => sortByDate(mockDiapers, 'time'),
  getByPerson: (personId: string): DiaperEvent[] =>
    sortByDate(mockDiapers.filter(d => d.personId === personId), 'time'),
  getToday: (): DiaperEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return sortByDate(
      mockDiapers.filter(d => d.time.startsWith(today)),
      'time'
    );
  },
  getTodayCount: (): number => mockDiapers.length,
};

// --- Health ---
export const HealthRepository = {
  getAll: (): HealthLog[] => sortByDate(mockHealthLogs, 'time'),
  getByPerson: (personId: string): HealthLog[] =>
    sortByDate(mockHealthLogs.filter(h => h.personId === personId), 'time'),
  getByType: (type: string): HealthLog[] =>
    sortByDate(mockHealthLogs.filter(h => h.type === type), 'time'),
  getWeightHistory: (personId: string): HealthLog[] =>
    sortByDate(mockHealthLogs.filter(h => h.personId === personId && h.type === 'weight'), 'time', false),
};

// --- Medications ---
export const MedicationsRepository = {
  getAll: (): MedicationLog[] => sortByDate(mockMedications, 'time'),
  getByPerson: (personId: string): MedicationLog[] =>
    sortByDate(mockMedications.filter(m => m.personId === personId), 'time'),
  getTodayByPerson: (personId: string): MedicationLog[] => {
    const today = new Date().toISOString().split('T')[0];
    return mockMedications.filter(m => m.personId === personId && m.time.startsWith(today));
  },
};

// --- Appointments ---
export const AppointmentsRepository = {
  getAll: (): Appointment[] => sortByDate(mockAppointments, 'dateTime'),
  getUpcoming: (): Appointment[] =>
    sortByDate(
      mockAppointments.filter(a => a.status === 'scheduled' && a.dateTime >= new Date().toISOString()),
      'dateTime', false
    ),
  getPast: (): Appointment[] =>
    sortByDate(
      mockAppointments.filter(a => a.status === 'completed' || a.dateTime < new Date().toISOString()),
      'dateTime'
    ),
  getByPerson: (personId: string): Appointment[] =>
    sortByDate(mockAppointments.filter(a => a.personId === personId), 'dateTime'),
};

// --- Tasks ---
export const TasksRepository = {
  getAll: (): FamilyTask[] => mockTasks,
  getOpen: (): FamilyTask[] => mockTasks.filter(t => t.status === 'todo' || t.status === 'in_progress'),
  getByStatus: (status: string): FamilyTask[] => mockTasks.filter(t => t.status === status),
  getByCategory: (category: string): FamilyTask[] => mockTasks.filter(t => t.category === category),
  getByAssignee: (assigneeId: string): FamilyTask[] => mockTasks.filter(t => t.assigneeId === assigneeId),
  getOverdue: (): FamilyTask[] =>
    mockTasks.filter(t => t.status === 'todo' && t.dueDate && t.dueDate < new Date().toISOString()),
  getCompleted: (): FamilyTask[] => sortByDate(mockTasks.filter(t => t.status === 'done'), 'completedAt'),
};

// --- Alerts ---
export const AlertsRepository = {
  getAll: (): AlertItem[] => mockAlerts,
  getOpen: (): AlertItem[] => mockAlerts.filter(a => !a.dismissed),
  getBySeverity: (severity: string): AlertItem[] => mockAlerts.filter(a => a.severity === severity),
};

// --- Timeline ---
export const TimelineRepository = {
  getAll: (): TimelineEntry[] => mockTimeline,
  getByPerson: (personId: string): TimelineEntry[] =>
    mockTimeline.filter(e => e.personId === personId),
  getByType: (type: string): TimelineEntry[] =>
    mockTimeline.filter(e => e.type === type),
  getByDateRange: (start: string, end: string): TimelineEntry[] =>
    mockTimeline.filter(e => e.time >= start && e.time <= end),
  search: (query: string): TimelineEntry[] =>
    mockTimeline.filter(e =>
      e.title.includes(query) || e.subtitle?.includes(query) || e.personName?.includes(query)
    ),
};

// --- Dashboard ---
export const DashboardRepository = {
  getTodaySummary: (): DashboardSummary => mockDashboardSummary,
};

// --- Mother Recovery ---
export const MotherRecoveryRepository = {
  getMetrics: (): MotherRecoveryMetrics => mockMotherRecoveryMetrics,
  getLatestDaily: (): import('../../types/domain').MotherDailySummary | undefined =>
    mockMotherRecoveryMetrics.dailySummaries[0],
};

// --- Charts ---
export const ChartsRepository = {
  getFeedingDaily: (): ChartDataPoint[] => mockFeedingChart,
  getSleepDaily: (): ChartDataPoint[] => mockSleepChart,
  getDiaperDaily: (): ChartDataPoint[] => mockDiaperChart,
};

// --- Sync ---
export const SyncRepository = {
  getState: (): SyncState => mockSyncState,
  getLog: (): SyncLogEntry[] => mockSyncLog,
};
