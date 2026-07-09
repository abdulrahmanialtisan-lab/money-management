import { addDays, clampDayOfMonth, compareDateKeys, fromDateKey, toDateKey } from '../utils/date'

/** Latest date <= todayKey whose day-of-month matches `payday` (clamped for short months). */
export function computeExpectedPeriodStart(todayKey: string, payday: number): string {
  const t = fromDateKey(todayKey)
  const y = t.getFullYear()
  const m = t.getMonth()

  const dayThisMonth = clampDayOfMonth(y, m, payday)
  const candidateThisMonth = toDateKey(new Date(y, m, dayThisMonth))
  if (compareDateKeys(candidateThisMonth, todayKey) <= 0) {
    return candidateThisMonth
  }

  const pm = m - 1
  const py = pm < 0 ? y - 1 : y
  const pmNorm = ((pm % 12) + 12) % 12
  const dayPrevMonth = clampDayOfMonth(py, pmNorm, payday)
  return toDateKey(new Date(py, pmNorm, dayPrevMonth))
}

/** The next payday strictly after `startKey`. */
export function nextPeriodStart(startKey: string, payday: number): string {
  const s = fromDateKey(startKey)
  const y = s.getFullYear()
  const m = s.getMonth()
  const nm = m + 1
  const ny = nm > 11 ? y + 1 : y
  const nmNorm = nm % 12
  const day = clampDayOfMonth(ny, nmNorm, payday)
  return toDateKey(new Date(ny, nmNorm, day))
}

export function periodEndFor(startKey: string, payday: number): string {
  return addDays(nextPeriodStart(startKey, payday), -1)
}

/**
 * Sequence of period-start dates strictly after `afterStartKey` (or, if null,
 * just `uptoStartKey`) up to and including `uptoStartKey`. Lets the caller
 * catch up in one pass if the app wasn't opened for two or more paydays.
 */
export function generatePeriodStartsBetween(
  afterStartKey: string | null,
  uptoStartKey: string,
  payday: number,
): string[] {
  if (afterStartKey === null) return [uptoStartKey]
  if (compareDateKeys(afterStartKey, uptoStartKey) >= 0) return []

  const starts: string[] = []
  let cursor = afterStartKey
  while (compareDateKeys(cursor, uptoStartKey) < 0) {
    cursor = nextPeriodStart(cursor, payday)
    starts.push(cursor)
  }
  return starts
}
