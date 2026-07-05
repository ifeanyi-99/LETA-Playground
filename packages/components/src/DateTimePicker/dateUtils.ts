/** Date helpers for the Date & Time Pickers. Monday-first week. */

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
/** 3-letter month abbreviations (desktop calendars show "Nov 2024"). */
export const MONTHS_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export interface DayCell {
  date: Date;
  /** True if the day belongs to the displayed month (false = leading/trailing filler). */
  inMonth: boolean;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-first weekday index: Mon=0 … Sun=6. */
export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Weekday-aligned month grid (Monday-first), padded with leading/trailing days
 * from the adjacent months so every row has 7 cells.
 */
export function monthMatrix(year: number, month: number): DayCell[][] {
  const first = new Date(year, month, 1);
  const lead = mondayIndex(first);
  const total = daysInMonth(year, month);
  const cells: DayCell[] = [];
  // leading (prev month)
  for (let i = lead; i > 0; i--) cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  // current month
  for (let d = 1; d <= total; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  // trailing (next month) to complete the final week
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!.date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function addMonths(year: number, month: number, n: number): { year: number; month: number } {
  const d = new Date(year, month + n, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Strictly between start and end (exclusive of both endpoints). */
export function isBetween(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = day.setHours(0, 0, 0, 0);
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  return t > Math.min(s, e) && t < Math.max(s, e);
}

export function formatMonthYear(year: number, month: number, abbreviated = false): string {
  return `${(abbreviated ? MONTHS_ABBR : MONTHS)[month]} ${year}`;
}

export function diffDaysInclusive(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  return Math.abs(Math.round((e - s) / 86400000)) + 1;
}

/** "12:00 AM" … "11:30 PM" at the given step in minutes (default 30). */
export function timeOptions(stepMinutes = 30): string[] {
  const out: string[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const period = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    out.push(`${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`);
  }
  return out;
}
