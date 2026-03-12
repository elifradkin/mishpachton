/**
 * Layer C — File Parsers
 * 
 * Safe JSON parsers with type validation for each data entity.
 * These insulate the rest of the app from raw file structure.
 * 
 * Every parser:
 * - Accepts unknown input
 * - Returns typed array or object
 * - Never throws — returns empty/default on failure
 * - Logs warnings for malformed data
 */

import type {
  Person, FeedingEvent, SleepEvent, DiaperEvent, HealthLog,
  MedicationLog, Appointment, FamilyTask, AlertItem, Reminder,
  TimelineEntry, DashboardSummary, MotherRecoveryMetrics,
  ChartDataPoint, LatestState
} from '../../types/domain';

// --- Generic safe parser ---
function safeParse<T>(raw: unknown, entityName: string, validate: (item: unknown) => item is T): T[] {
  if (!Array.isArray(raw)) {
    if (raw != null) {
      console.warn(`[Parser] ${entityName}: expected array, got ${typeof raw}`);
    }
    return [];
  }

  const results: T[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (validate(raw[i])) {
      results.push(raw[i]);
    } else {
      console.warn(`[Parser] ${entityName}[${i}]: failed validation, skipping`);
    }
  }
  return results;
}

function safeParseObject<T>(raw: unknown, entityName: string, validate: (item: unknown) => item is T, fallback: T): T {
  if (raw == null) {
    return fallback;
  }
  if (validate(raw)) {
    return raw;
  }
  console.warn(`[Parser] ${entityName}: failed validation, using fallback`);
  return fallback;
}

// --- Type Guards ---
function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'string';
}

function hasId(obj: Record<string, unknown>): boolean {
  return hasString(obj, 'id');
}

// --- Person Parser ---
function isPerson(v: unknown): v is Person {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'name') && hasString(v, 'role') && hasString(v, 'createdAt');
}

export function parsePersons(raw: unknown): Person[] {
  return safeParse(raw, 'persons', isPerson);
}

// --- Feeding Parser ---
function isFeedingEvent(v: unknown): v is FeedingEvent {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'type') && hasString(v, 'startTime') && hasString(v, 'createdAt');
}

export function parseFeedings(raw: unknown): FeedingEvent[] {
  return safeParse(raw, 'feedings', isFeedingEvent);
}

// --- Sleep Parser ---
function isSleepEvent(v: unknown): v is SleepEvent {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'type') && hasString(v, 'startTime') && hasString(v, 'createdAt');
}

export function parseSleeps(raw: unknown): SleepEvent[] {
  return safeParse(raw, 'sleeps', isSleepEvent);
}

// --- Diaper Parser ---
function isDiaperEvent(v: unknown): v is DiaperEvent {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'type') && hasString(v, 'time') && hasString(v, 'createdAt');
}

export function parseDiapers(raw: unknown): DiaperEvent[] {
  return safeParse(raw, 'diapers', isDiaperEvent);
}

// --- Health Log Parser ---
function isHealthLog(v: unknown): v is HealthLog {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'type') && hasString(v, 'time') && hasString(v, 'createdAt');
}

export function parseHealthLogs(raw: unknown): HealthLog[] {
  return safeParse(raw, 'health_logs', isHealthLog);
}

// --- Medication Parser ---
function isMedicationLog(v: unknown): v is MedicationLog {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'name') && hasString(v, 'time') && hasString(v, 'createdAt');
}

export function parseMedications(raw: unknown): MedicationLog[] {
  return safeParse(raw, 'medications', isMedicationLog);
}

// --- Appointment Parser ---
function isAppointment(v: unknown): v is Appointment {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'personId') && hasString(v, 'title') && hasString(v, 'dateTime') && hasString(v, 'createdAt');
}

export function parseAppointments(raw: unknown): Appointment[] {
  return safeParse(raw, 'appointments', isAppointment);
}

// --- Task Parser ---
function isFamilyTask(v: unknown): v is FamilyTask {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'title') && hasString(v, 'priority') && hasString(v, 'status') && hasString(v, 'createdAt');
}

export function parseTasks(raw: unknown): FamilyTask[] {
  return safeParse(raw, 'tasks', isFamilyTask);
}

// --- Alert Parser ---
function isAlertItem(v: unknown): v is AlertItem {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'severity') && hasString(v, 'title') && hasString(v, 'message') && hasString(v, 'createdAt');
}

export function parseAlerts(raw: unknown): AlertItem[] {
  return safeParse(raw, 'alerts', isAlertItem);
}

// --- Chart Data Parser ---
function isChartDataPoint(v: unknown): v is ChartDataPoint {
  if (!isObject(v)) return false;
  return hasString(v, 'date') && typeof v.value === 'number';
}

export function parseChartData(raw: unknown): ChartDataPoint[] {
  return safeParse(raw, 'chart_data', isChartDataPoint);
}

// --- Timeline Parser ---
function isTimelineEntry(v: unknown): v is TimelineEntry {
  if (!isObject(v)) return false;
  return hasId(v) && hasString(v, 'type') && hasString(v, 'time') && hasString(v, 'title');
}

export function parseTimeline(raw: unknown): TimelineEntry[] {
  return safeParse(raw, 'timeline', isTimelineEntry);
}

// --- Raw JSON file parser ---
export function parseJsonFile<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('[Parser] Failed to parse JSON:', error);
    return fallback;
  }
}
