import { DateTime } from 'luxon';

import { buildMonthlySeries, monthlySeriesStart } from './monthly-counts';
import { describe, expect, it } from 'bun:test';

describe('buildMonthlySeries', () => {
  it('should fill missing months with zero over the last 12 months', () => {
    const now = DateTime.fromISO('2026-09-17');
    const series = buildMonthlySeries(
      [
        { month: '2026-09', count: 4 },
        { month: '2026-07', count: 2 },
      ],
      { now },
    );

    expect(series).toHaveLength(12);
    expect(series[0]).toEqual({ month: '2025-10', count: 0 });
    expect(series.at(-3)).toEqual({ month: '2026-07', count: 2 });
    expect(series.at(-2)).toEqual({ month: '2026-08', count: 0 });
    expect(series.at(-1)).toEqual({ month: '2026-09', count: 4 });
  });
});

describe('monthlySeriesStart', () => {
  it('should start at the first day of the month 11 months ago', () => {
    const now = DateTime.fromISO('2026-09-17T15:00:00.000Z', { zone: 'utc' });
    expect(monthlySeriesStart(now).toISOString()).toBe('2025-10-01T00:00:00.000Z');
  });
});
