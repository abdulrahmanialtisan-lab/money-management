import { diffInDays } from '../utils/date'
import type { Goal } from './types'

export interface GoalProgress {
  pct: number
  remaining: number
  isAchieved: boolean
}

export function computeGoalProgress(goal: Pick<Goal, 'targetAmount' | 'currentAmount'>): GoalProgress {
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  return { pct, remaining, isAchieved: goal.currentAmount >= goal.targetAmount }
}

/**
 * How much to contribute per week to hit `targetDate` from today, given what's
 * left to save. Returns null when there's no target date, it's already past,
 * or the goal is already funded.
 */
export function computeSuggestedWeeklyContribution(
  goal: Pick<Goal, 'targetAmount' | 'currentAmount' | 'targetDate'>,
  todayKey: string,
): number | null {
  if (!goal.targetDate) return null
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return null
  const daysLeft = diffInDays(todayKey, goal.targetDate)
  if (daysLeft <= 0) return null
  const weeksLeft = Math.max(1, daysLeft / 7)
  return remaining / weeksLeft
}
