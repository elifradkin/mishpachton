import { he, en } from './dictionaries';
import type { I18nDictionary, Locale } from '../types/domain';

const dictionaries: Record<Locale, I18nDictionary> = { he, en };

let currentLocale: Locale = 'he';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get a translation string by dot-separated path.
 * Supports simple {n} interpolation.
 */
export function t(path: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[currentLocale] || dictionaries.he;
  const keys = path.split('.');
  let result: unknown = dict;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Fallback to Hebrew
      result = keys.reduce<unknown>(
        (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
        dictionaries.he
      );
      break;
    }
  }

  if (typeof result !== 'string') {
    return path; // Return the path as fallback
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [key, value]) => str.replace(`{${key}}`, String(value)),
      result
    );
  }

  return result;
}
