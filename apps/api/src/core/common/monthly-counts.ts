import { DateTime } from 'luxon';

export type MonthlyCount = {
  month: string;
  count: number;
};

export const ADMIN_GROWTH_MONTHS = 12;

export function monthlySeriesStart(now: DateTime = DateTime.now(), monthCount = ADMIN_GROWTH_MONTHS): Date {
  return now
    .toUTC()
    .startOf('month')
    .minus({ months: monthCount - 1 })
    .toJSDate();
}

export function buildMonthlySeries(
  rows: MonthlyCount[],
  options: { monthCount?: number; now?: DateTime } = {},
): MonthlyCount[] {
  const monthCount = options.monthCount ?? ADMIN_GROWTH_MONTHS;
  const start = (options.now ?? DateTime.now())
    .toUTC()
    .startOf('month')
    .minus({ months: monthCount - 1 });
  const byMonth = new Map(rows.map(row => [row.month, row.count]));

  return Array.from({ length: monthCount }, (_, index) => {
    const month = start.plus({ months: index }).toFormat('yyyy-MM');
    return { month, count: byMonth.get(month) ?? 0 };
  });
}
