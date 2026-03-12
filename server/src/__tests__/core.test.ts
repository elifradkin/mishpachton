/**
 * Tests for critical data flows:
 * - File parsers (malformed data handling)
 * - Repository accessors
 * - Utility functions
 * - Cache behavior
 * 
 * Run: npx vitest run
 */
import { describe, it, expect } from 'vitest';
import {
  parsePersons, parseFeedings, parseSleeps, parseDiapers,
  parseHealthLogs, parseMedications, parseAppointments, parseTasks,
  parseAlerts, parseChartData, parseTimeline, parseJsonFile
} from '../layers/data-access/parsers';
import {
  safeJsonParse, formatDuration, formatPercentage, groupBy, sortByDate, getDayKey
} from '../utils';

// ─── Parser Tests ───
describe('Parsers', () => {
  describe('parsePersons', () => {
    it('returns empty array for null input', () => {
      expect(parsePersons(null)).toEqual([]);
    });

    it('returns empty array for non-array input', () => {
      expect(parsePersons('not an array')).toEqual([]);
      expect(parsePersons(42)).toEqual([]);
      expect(parsePersons({})).toEqual([]);
    });

    it('filters out invalid items', () => {
      const input = [
        { id: 'p1', name: 'Test', role: 'baby', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'p2' }, // missing name, role, createdAt
        null,
        'string',
        { id: 'p3', name: 'Valid', role: 'mother', createdAt: '2024-01-01T00:00:00Z' },
      ];
      const result = parsePersons(input);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('p1');
      expect(result[1].id).toBe('p3');
    });
  });

  describe('parseFeedings', () => {
    it('handles empty array', () => {
      expect(parseFeedings([])).toEqual([]);
    });

    it('parses valid feedings', () => {
      const input = [
        { id: 'f1', personId: 'baby-1', type: 'breast_left', startTime: '2024-01-01T10:00:00Z', createdAt: '2024-01-01T10:00:00Z' },
      ];
      const result = parseFeedings(input);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('breast_left');
    });
  });

  describe('parseAlerts', () => {
    it('skips items missing required fields', () => {
      const input = [
        { id: 'a1', severity: 'warning', title: 'Test', message: 'msg', createdAt: '2024-01-01' },
        { id: 'a2', severity: 'info' }, // missing title, message, createdAt
      ];
      const result = parseAlerts(input);
      expect(result).toHaveLength(1);
    });
  });

  describe('parseJsonFile', () => {
    it('parses valid JSON', () => {
      expect(parseJsonFile('{"a":1}', {})).toEqual({ a: 1 });
    });

    it('returns fallback for invalid JSON', () => {
      expect(parseJsonFile('not json', 'fallback')).toBe('fallback');
      expect(parseJsonFile('', [])).toEqual([]);
    });
  });

  describe('parseChartData', () => {
    it('parses valid chart data', () => {
      const input = [
        { date: '2024-01-01', value: 5 },
        { date: '2024-01-02', value: 7 },
      ];
      expect(parseChartData(input)).toHaveLength(2);
    });

    it('rejects items without value', () => {
      const input = [
        { date: '2024-01-01', value: 5 },
        { date: '2024-01-02' }, // missing value
      ];
      expect(parseChartData(input)).toHaveLength(1);
    });
  });
});

// ─── Utility Tests ───
describe('Utils', () => {
  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      expect(safeJsonParse('{"x":1}', null)).toEqual({ x: 1 });
    });

    it('returns fallback for invalid JSON', () => {
      expect(safeJsonParse('bad', 'default')).toBe('default');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes', () => {
      expect(formatDuration(45)).toBe('45 דק׳');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 שע׳ 30 דק׳');
    });

    it('formats exact hours', () => {
      expect(formatDuration(120)).toBe('2 שע׳');
    });

    it('handles null', () => {
      expect(formatDuration(null)).toBe('—');
    });

    it('handles undefined', () => {
      expect(formatDuration(undefined)).toBe('—');
    });
  });

  describe('formatPercentage', () => {
    it('formats basic percentage', () => {
      expect(formatPercentage(0.75)).toBe('75%');
    });

    it('formats with decimals', () => {
      expect(formatPercentage(0.756, 1)).toBe('75.6%');
    });
  });

  describe('groupBy', () => {
    it('groups items by key function', () => {
      const items = [
        { name: 'a', group: 'x' },
        { name: 'b', group: 'y' },
        { name: 'c', group: 'x' },
      ];
      const result = groupBy(items, (i) => i.group);
      expect(Object.keys(result)).toEqual(['x', 'y']);
      expect(result['x']).toHaveLength(2);
      expect(result['y']).toHaveLength(1);
    });
  });

  describe('sortByDate', () => {
    it('sorts descending by default', () => {
      const items = [
        { time: '2024-01-01' },
        { time: '2024-01-03' },
        { time: '2024-01-02' },
      ];
      const sorted = sortByDate(items, 'time');
      expect(sorted[0].time).toBe('2024-01-03');
      expect(sorted[2].time).toBe('2024-01-01');
    });

    it('sorts ascending when specified', () => {
      const items = [
        { time: '2024-01-03' },
        { time: '2024-01-01' },
      ];
      const sorted = sortByDate(items, 'time', false);
      expect(sorted[0].time).toBe('2024-01-01');
    });
  });

  describe('getDayKey', () => {
    it('extracts date key', () => {
      expect(getDayKey('2024-03-15T14:30:00Z')).toBe('2024-03-15');
    });

    it('handles invalid input', () => {
      expect(getDayKey('bad')).toBe('unknown');
    });
  });
});
