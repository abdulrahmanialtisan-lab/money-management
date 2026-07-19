import type { Commitment, Debt } from '../domain/types'
import { addDays, today } from '../utils/date'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

const NOTIFIED_KEY_PREFIX = 'payday:notified:'

/** Checked on app open (no push server): notifies once per commitment/due-date if due within 2 days. */
export function checkUpcomingCommitments(commitments: Commitment[]): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const todayKey = today()
  const horizonKey = addDays(todayKey, 2)
  const now = new Date()

  for (const c of commitments) {
    if (!c.active || !c.dueDayOfMonth) continue
    const day = Math.min(c.dueDayOfMonth, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
    const due = new Date(now.getFullYear(), now.getMonth(), day)
    const dueKey = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`
    if (dueKey < todayKey || dueKey > horizonKey) continue

    const flagKey = `${NOTIFIED_KEY_PREFIX}${c.id}:${dueKey}`
    if (localStorage.getItem(flagKey)) continue

    new Notification(c.name, { body: `${c.amount} — due ${dueKey}` })
    localStorage.setItem(flagKey, '1')
  }
}

/** Same one-per-due-date pattern as commitments, for debts that carry a due date. */
export function checkUpcomingDebts(debts: Debt[]): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const todayKey = today()
  const horizonKey = addDays(todayKey, 2)

  for (const d of debts) {
    if (d.status !== 'active' || !d.dueDate) continue
    if (d.dueDate < todayKey || d.dueDate > horizonKey) continue

    const flagKey = `${NOTIFIED_KEY_PREFIX}debt:${d.id}:${d.dueDate}`
    if (localStorage.getItem(flagKey)) continue

    new Notification(d.name, { body: `${d.remainingAmount} — due ${d.dueDate}` })
    localStorage.setItem(flagKey, '1')
  }
}
