// ============================================================
// CORE DOMAIN TYPES — Mishpachton Family Management App
// ============================================================

// --- Base Types ---
export type EntityId = string;
export type ISODateString = string;
export type ISOTimeString = string;
export type Locale = 'he' | 'en';

export interface BaseEntity {
  id: EntityId;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

// --- Person ---
export type PersonRole = 'baby' | 'mother' | 'father' | 'caregiver' | 'family_member';

export interface Person extends BaseEntity {
  name: string;
  role: PersonRole;
  dateOfBirth?: ISODateString;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

// --- Feeding ---
export type FeedingType = 'breast_left' | 'breast_right' | 'bottle_breast_milk' | 'bottle_formula' | 'solid' | 'supplement';

export interface FeedingEvent extends BaseEntity {
  personId: EntityId;
  type: FeedingType;
  startTime: ISODateString;
  endTime?: ISODateString;
  durationMinutes?: number;
  amountMl?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// --- Sleep ---
export type SleepType = 'nap' | 'night_sleep';
export type SleepQuality = 'good' | 'fair' | 'poor' | 'unknown';

export interface SleepEvent extends BaseEntity {
  personId: EntityId;
  type: SleepType;
  startTime: ISODateString;
  endTime?: ISODateString;
  durationMinutes?: number;
  quality?: SleepQuality;
  location?: string;
  notes?: string;
}

// --- Diaper ---
export type DiaperType = 'wet' | 'dirty' | 'both' | 'dry';
export type DiaperConsistency = 'normal' | 'loose' | 'hard' | 'mucus' | 'other';

export interface DiaperEvent extends BaseEntity {
  personId: EntityId;
  type: DiaperType;
  time: ISODateString;
  consistency?: DiaperConsistency;
  color?: string;
  notes?: string;
}

// --- Health ---
export type HealthLogType = 'temperature' | 'weight' | 'height' | 'head_circumference' | 'symptom' | 'milestone' | 'note';

export interface HealthLog extends BaseEntity {
  personId: EntityId;
  type: HealthLogType;
  time: ISODateString;
  value?: number;
  unit?: string;
  description?: string;
  notes?: string;
}

// --- Medication ---
export type MedicationFrequency = 'once' | 'daily' | 'twice_daily' | 'as_needed' | 'weekly';

export interface MedicationLog extends BaseEntity {
  personId: EntityId;
  name: string;
  dosage?: string;
  frequency?: MedicationFrequency;
  time: ISODateString;
  taken: boolean;
  notes?: string;
}

// --- Appointment ---
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';
export type AppointmentType = 'checkup' | 'vaccination' | 'specialist' | 'emergency' | 'other';

export interface Appointment extends BaseEntity {
  personId: EntityId;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  dateTime: ISODateString;
  location?: string;
  provider?: string;
  prepTasks?: string[];
  summary?: string;
  notes?: string;
  documents?: string[];
}

// --- Task ---
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskCategory = 'baby_care' | 'household' | 'shopping' | 'logistics' | 'moving' | 'health' | 'admin' | 'other';

export interface FamilyTask extends BaseEntity {
  title: string;
  description?: string;
  assigneeId?: EntityId;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: ISODateString;
  completedAt?: ISODateString;
  tags?: string[];
  notes?: string;
}

// --- Reminder ---
export type ReminderType = 'medication' | 'appointment' | 'task' | 'feeding' | 'custom';

export interface Reminder extends BaseEntity {
  type: ReminderType;
  title: string;
  message?: string;
  time: ISODateString;
  dismissed: boolean;
  linkedEntityId?: EntityId;
  linkedEntityType?: string;
}

// --- Alert ---
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertItem extends BaseEntity {
  severity: AlertSeverity;
  title: string;
  message: string;
  category?: string;
  dismissed: boolean;
  linkedEntityId?: EntityId;
  actionLabel?: string;
  actionUrl?: string;
}

// --- Timeline ---
export type TimelineEventType =
  | 'feeding'
  | 'sleep'
  | 'diaper'
  | 'health'
  | 'medication'
  | 'appointment'
  | 'task'
  | 'reminder'
  | 'alert'
  | 'milestone'
  | 'note';

export interface TimelineEntry {
  id: EntityId;
  type: TimelineEventType;
  personId?: EntityId;
  personName?: string;
  time: ISODateString;
  title: string;
  subtitle?: string;
  details?: Record<string, unknown>;
  icon?: string;
}

// --- Dashboard ---
export interface DashboardSummary {
  date: ISODateString;
  feedingCount: number;
  feedingTotalMl?: number;
  lastFeedingTime?: ISODateString;
  lastFeedingType?: FeedingType;
  sleepTotalMinutes: number;
  sleepSessions: number;
  diaperCount: number;
  diaperWet: number;
  diaperDirty: number;
  openAlerts: AlertItem[];
  upcomingAppointments: Appointment[];
  openTasks: number;
  overdueTasks: number;
  motherCheckIn?: MotherDailySummary;
  lastSyncTime?: ISODateString;
  isStale: boolean;
}

// --- Mother Recovery ---
export interface MotherDailySummary {
  date: ISODateString;
  hydrationGlasses?: number;
  hydrationGoal?: number;
  supplementsTaken?: string[];
  supplementsMissed?: string[];
  symptoms?: string[];
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  moodRating?: number; // 1-5
  energyRating?: number; // 1-5
  notes?: string;
}

export interface MotherRecoveryMetrics {
  dailySummaries: MotherDailySummary[];
  averageSleepHours: number;
  averageMoodRating: number;
  averageEnergyRating: number;
  hydrationAdherence: number; // 0-1
  supplementAdherence: number; // 0-1
  symptomFrequency: Record<string, number>;
}

// --- Charts ---
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: ChartDataPoint[];
}

// --- Sync ---
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'stale';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: ISODateString | null;
  lastSuccessTime: ISODateString | null;
  lastError: string | null;
  filesUpdated: number;
  isAutoSyncEnabled: boolean;
}

export interface SyncLogEntry {
  timestamp: ISODateString;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

// --- Cache ---
export interface CacheMetadata {
  version: string;
  lastUpdated: ISODateString;
  fileCount: number;
  totalSizeBytes: number;
  files: Record<string, {
    lastModified: ISODateString;
    sizeBytes: number;
    checksum?: string;
  }>;
}

// --- Config ---
export interface SyncConfig {
  host: string;
  port: number;
  username: string;
  remotePath: string;
  autoSyncOnStartup: boolean;
  syncIntervalMinutes?: number;
}

// --- i18n ---
export interface I18nDictionary {
  [key: string]: string | I18nDictionary;
}

// --- Indexes ---
export interface DateIndex {
  [dateKey: string]: EntityId[];
}

export interface PersonIndex {
  [personId: string]: EntityId[];
}

export interface LatestState {
  lastFeeding?: FeedingEvent;
  lastSleep?: SleepEvent;
  lastDiaper?: DiaperEvent;
  lastHealthLog?: HealthLog;
  lastMedication?: MedicationLog;
  nextAppointment?: Appointment;
}

// --- Raw file structures (what we receive from OpenClaw) ---
export interface RawFileManifest {
  normalized: string[];
  derived: string[];
  indexes: string[];
  schemas: string[];
}
