import { computeCommitmentDeduction } from '../domain/commitments'
import { computeExpectedPeriodStart, generatePeriodStartsBetween, periodEndFor } from '../domain/payPeriod'
import type { PayPeriod, Settings } from '../domain/types'
import { computeVerdict } from '../domain/verdict'
import { computeWeeks } from '../domain/weeklyBudget'
import { today } from '../utils/date'
import { makeId } from '../utils/id'
import { db, getSettings } from './db'

async function freezeSummary(period: PayPeriod): Promise<NonNullable<PayPeriod['closedSummary']>> {
  const txs = await db.transactions.where('periodId').equals(period.id).toArray()
  const verdict = computeVerdict(
    txs.map((t) => ({ importanceSnapshot: t.importanceSnapshot, amount: t.amount })),
    50,
  )
  const weeklyActuals = period.weeks.map((w) =>
    txs.filter((t) => t.date >= w.startDate && t.date <= w.endDate).reduce((sum, t) => sum + t.amount, 0),
  )
  return {
    totalSpent: verdict.totalSpent,
    importantSpent: verdict.importantSpent,
    unimportantSpent: verdict.unimportantSpent,
    unclassifiedSpent: verdict.unclassifiedSpent,
    importantPct: verdict.importantPct,
    weeklyActuals,
  }
}

async function closePeriod(period: PayPeriod): Promise<void> {
  const summary = await freezeSummary(period)
  await db.payPeriods.update(period.id, {
    status: 'closed',
    closedSummary: summary,
    updatedAt: new Date().toISOString(),
  })
}

async function createPeriod(startDate: string, settings: Settings, salaryOverride?: number): Promise<PayPeriod> {
  const endDate = periodEndFor(startDate, settings.payday)
  const commitments = await db.commitments.toArray()
  const salaryAmount = salaryOverride ?? settings.defaultSalaryAmount
  const deduction = computeCommitmentDeduction(commitments, salaryAmount)
  const weeks = computeWeeks(startDate, endDate, settings.weekStartDay, deduction.leftoverAfterCommitments)
  const now = new Date().toISOString()

  const period: PayPeriod = {
    id: makeId(),
    startDate,
    endDate,
    salaryAmount,
    status: 'active',
    totalCommitments: deduction.totalCommitments,
    commitmentBreakdown: deduction.breakdown,
    leftoverAfterCommitments: deduction.leftoverAfterCommitments,
    weeks,
    createdAt: now,
    updatedAt: now,
  }
  await db.payPeriods.add(period)
  return period
}

export async function getActivePeriod(): Promise<PayPeriod | undefined> {
  return db.payPeriods.where('status').equals('active').first()
}

// Guards against concurrent invocations (React StrictMode's double-effect, rapid
// visibilitychange events) racing to both see "no active period" and each create one.
let rollInFlight: Promise<void> | null = null

/** Called on app bootstrap / visibility-regain. Rolls the active period forward if payday has passed. */
export function rollPeriodsIfNeeded(settings: Settings): Promise<void> {
  if (rollInFlight) return rollInFlight
  rollInFlight = doRollPeriodsIfNeeded(settings).finally(() => {
    rollInFlight = null
  })
  return rollInFlight
}

async function doRollPeriodsIfNeeded(settings: Settings): Promise<void> {
  const todayKey = today()
  const expectedStart = computeExpectedPeriodStart(todayKey, settings.payday)
  const active = await getActivePeriod()

  if (active && active.startDate === expectedStart) return

  const startsToCreate = generatePeriodStartsBetween(active ? active.startDate : null, expectedStart, settings.payday)
  if (startsToCreate.length === 0) return

  if (active) await closePeriod(active)

  for (let i = 0; i < startsToCreate.length; i++) {
    const start = startsToCreate[i]
    const isLast = i === startsToCreate.length - 1
    const period = await createPeriod(start, settings)
    if (!isLast) await closePeriod(period)
  }
}

/** Manual "mark salary received now" override — closes the active period and starts a new one today. */
export async function markSalaryReceivedNow(salaryAmount?: number): Promise<void> {
  const settings = await getSettings()
  const active = await getActivePeriod()
  if (active) await closePeriod(active)
  await createPeriod(today(), settings, salaryAmount)
}

export async function updateActivePeriodSalary(newSalary: number): Promise<void> {
  const active = await getActivePeriod()
  if (!active) return
  const settings = await getSettings()
  const commitments = await db.commitments.toArray()
  const deduction = computeCommitmentDeduction(commitments, newSalary)
  const weeks = computeWeeks(active.startDate, active.endDate, settings.weekStartDay, deduction.leftoverAfterCommitments)
  await db.payPeriods.update(active.id, {
    salaryAmount: newSalary,
    totalCommitments: deduction.totalCommitments,
    commitmentBreakdown: deduction.breakdown,
    leftoverAfterCommitments: deduction.leftoverAfterCommitments,
    weeks,
    updatedAt: new Date().toISOString(),
  })
}

/** Re-snapshots commitments into the currently active period (does not touch closed periods). */
export async function recalculateActivePeriodCommitments(): Promise<void> {
  const active = await getActivePeriod()
  if (!active) return
  const settings = await getSettings()
  const commitments = await db.commitments.toArray()
  const deduction = computeCommitmentDeduction(commitments, active.salaryAmount)
  const weeks = computeWeeks(active.startDate, active.endDate, settings.weekStartDay, deduction.leftoverAfterCommitments)
  await db.payPeriods.update(active.id, {
    totalCommitments: deduction.totalCommitments,
    commitmentBreakdown: deduction.breakdown,
    leftoverAfterCommitments: deduction.leftoverAfterCommitments,
    weeks,
    updatedAt: new Date().toISOString(),
  })
}
