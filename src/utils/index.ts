import { format, formatDistanceToNow, isToday, isYesterday, parseISO, isValid } from 'date-fns';
import { he } from 'date-fns/locale';

// --- Safe JSON Parsing ---
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    console.warn('[SafeParse] Failed to parse JSON, returning fallback');
    return fallback;
  }
}

export function safeParseArray<T>(data: unknown, validator?: (item: unknown) => item is T): T[] {
  if (!Array.isArray(data)) return [];
  if (validator) return data.filter(validator);
  return data as T[];
}

// --- Date Utilities ---
export function formatHebrewDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, 'd בMMMM yyyy', { locale: he });
  } catch {
    return '—';
  }
}

export function formatHebrewTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, 'HH:mm', { locale: he });
  } catch {
    return '—';
  }
}

export function formatHebrewDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    if (isToday(date)) return `היום, ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `אתמול, ${format(date, 'HH:mm')}`;
    return format(date, 'd/M/yy HH:mm', { locale: he });
  } catch {
    return '—';
  }
}

export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return 'לא ידוע';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'לא ידוע';
    return formatDistanceToNow(date, { addSuffix: true, locale: he });
  } catch {
    return 'לא ידוע';
  }
}

export function formatDuration(minutes: number | undefined | null): string {
  if (minutes == null || minutes < 0) return '—';
  if (minutes < 60) return `${Math.round(minutes)} דק׳`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hrs} שע׳`;
  return `${hrs} שע׳ ${mins} דק׳`;
}

export function formatShortDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, 'd/M', { locale: he });
  } catch {
    return '—';
  }
}

export function getDayKey(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd');
  } catch {
    return 'unknown';
  }
}

export function getHour(dateStr: string): number {
  try {
    return parseISO(dateStr).getHours();
  } catch {
    return 0;
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'dashboard.greeting';
  if (hour >= 12 && hour < 17) return 'dashboard.greetingAfternoon';
  if (hour >= 17 && hour < 21) return 'dashboard.greetingEvening';
  return 'dashboard.greetingNight';
}

// --- Number formatting ---
export function formatNumber(n: number | undefined | null): string {
  if (n == null) return '—';
  return n.toLocaleString('he-IL');
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// --- Grouping utilities ---
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function sortByDate<T>(items: T[], dateField: keyof T, desc = true): T[] {
  return [...items].sort((a, b) => {
    const da = String(a[dateField] || '');
    const db = String(b[dateField] || '');
    return desc ? db.localeCompare(da) : da.localeCompare(db);
  });
}

// --- Color utilities ---
export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-rose-500 bg-rose-50';
    case 'warning': return 'text-brand-600 bg-brand-50';
    case 'info': return 'text-sky-500 bg-sky-50';
    default: return 'text-sage-500 bg-sage-50';
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-rose-500 bg-rose-50 border-rose-200';
    case 'high': return 'text-brand-600 bg-brand-50 border-brand-200';
    case 'medium': return 'text-sky-500 bg-sky-50 border-sky-200';
    case 'low': return 'text-sage-500 bg-sage-50 border-sage-200';
    default: return 'text-sage-400 bg-sage-50 border-sage-200';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
    case 'success': return 'text-sage-600 bg-sage-100';
    case 'in_progress':
    case 'syncing': return 'text-sky-500 bg-sky-100';
    case 'todo':
    case 'scheduled': return 'text-brand-500 bg-brand-100';
    case 'cancelled':
    case 'missed':
    case 'error': return 'text-rose-500 bg-rose-100';
    default: return 'text-sage-400 bg-sage-50';
  }
}

// --- Clamp ---
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
