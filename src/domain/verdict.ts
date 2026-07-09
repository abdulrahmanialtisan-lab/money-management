import type { ImportanceOrUnclassified } from './types'

export interface VerdictInput {
  importanceSnapshot: ImportanceOrUnclassified
  amount: number
}

export interface VerdictResult {
  totalSpent: number
  importantSpent: number
  unimportantSpent: number
  unclassifiedSpent: number
  /** null when there's nothing classified yet to judge */
  importantPct: number | null
  color: 'green' | 'red' | 'neutral'
}

export function computeVerdict(transactions: VerdictInput[], targetRatio: number): VerdictResult {
  let importantSpent = 0
  let unimportantSpent = 0
  let unclassifiedSpent = 0

  for (const t of transactions) {
    if (t.importanceSnapshot === 'important') importantSpent += t.amount
    else if (t.importanceSnapshot === 'not_important') unimportantSpent += t.amount
    else unclassifiedSpent += t.amount
  }

  const totalSpent = importantSpent + unimportantSpent + unclassifiedSpent
  const classifiedTotal = importantSpent + unimportantSpent
  const importantPct = classifiedTotal > 0 ? Math.round((importantSpent / classifiedTotal) * 100) : null
  const color: VerdictResult['color'] =
    importantPct === null ? 'neutral' : importantPct >= targetRatio ? 'green' : 'red'

  return { totalSpent, importantSpent, unimportantSpent, unclassifiedSpent, importantPct, color }
}

export function comparePeriods(
  currentPct: number | null,
  previousPct: number | null,
): { deltaPct: number; direction: 'up' | 'down' | 'flat' } | null {
  if (currentPct === null || previousPct === null) return null
  const deltaPct = currentPct - previousPct
  return { deltaPct: Math.abs(deltaPct), direction: deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat' }
}
