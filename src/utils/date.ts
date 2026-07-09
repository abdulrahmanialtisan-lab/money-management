/**
 * All dates in this app are stored as local-date strings ("YYYY-MM-DD"), never
 * as UTC ISO timestamps, so day-boundary math can't drift across timezones.
 */

/**
 * WebKit/Safari's plain "ar-SA" locale has historically defaulted to the
 * Islamic Umm-al-Qura calendar for Intl date formatting, unlike other engines.
 * Pin the calendar and numbering system explicitly so dates render the same
 * (Gregorian, Western digits) everywhere regardless of browser default.
 */
export const AR_DATE_LOCALE = 'ar-SA-u-ca-gregory-nu-latn'

export function dateLocale(language: 'en' | 'ar'): string {
  return language === 'ar' ? AR_DATE_LOCALE : 'en-US'
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): string {
  return toDateKey(new Date())
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

/** Clamp a target day-of-month (1-31) to a real day in the given year/month. */
export function clampDayOfMonth(year: number, monthIndex0: number, day: number): number {
  return Math.min(day, daysInMonth(year, monthIndex0))
}

export function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function diffInDays(fromKey: string, toKey: string): number {
  const a = fromDateKey(fromKey)
  const b = fromDateKey(toKey)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function isWithinRange(key: string, startKey: string, endKey: string): boolean {
  return compareDateKeys(key, startKey) >= 0 && compareDateKeys(key, endKey) <= 0
}

const WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6] as const

/** Nearest date-key <= `fromKey` whose weekday matches `weekStartDay`. */
export function alignToWeekStart(fromKey: string, weekStartDay: number): string {
  const d = fromDateKey(fromKey)
  const currentDow = d.getDay()
  const diff = (currentDow - weekStartDay + 7) % 7
  return addDays(fromKey, -diff)
}

export const WEEKDAY_ORDER_LIST = WEEKDAY_ORDER
