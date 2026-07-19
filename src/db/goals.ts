import type { GoalStatus } from '../domain/types'
import { makeId } from '../utils/id'
import { today } from '../utils/date'
import { db } from './db'

export interface UpsertGoalInput {
  id?: string
  name: string
  targetAmount: number
  icon: string
  color: string
  targetDate?: string
}

export async function upsertGoal(input: UpsertGoalInput): Promise<string> {
  const now = new Date().toISOString()
  if (input.id) {
    await db.goals.update(input.id, {
      name: input.name,
      targetAmount: input.targetAmount,
      icon: input.icon,
      color: input.color,
      targetDate: input.targetDate,
      updatedAt: now,
    })
    return input.id
  }
  const id = makeId()
  await db.goals.add({
    id,
    name: input.name,
    targetAmount: input.targetAmount,
    currentAmount: 0,
    icon: input.icon,
    color: input.color,
    targetDate: input.targetDate,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function deleteGoal(id: string): Promise<void> {
  await db.transaction('rw', [db.goals, db.goalContributions], async () => {
    await db.goalContributions.where('goalId').equals(id).delete()
    await db.goals.delete(id)
  })
}

export async function setGoalStatus(id: string, status: GoalStatus): Promise<void> {
  await db.goals.update(id, { status, updatedAt: new Date().toISOString() })
}

export async function contributeToGoal(goalId: string, amount: number, date?: string, note?: string): Promise<void> {
  if (amount <= 0) return
  const now = new Date().toISOString()
  await db.transaction('rw', [db.goals, db.goalContributions], async () => {
    const goal = await db.goals.get(goalId)
    if (!goal) return
    const nextAmount = goal.currentAmount + amount
    await db.goals.update(goalId, {
      currentAmount: nextAmount,
      status: nextAmount >= goal.targetAmount && goal.status === 'active' ? 'achieved' : goal.status,
      updatedAt: now,
    })
    await db.goalContributions.add({ id: makeId(), goalId, amount, date: date ?? today(), note, createdAt: now })
  })
}

export async function deleteGoalContribution(id: string): Promise<void> {
  await db.transaction('rw', [db.goals, db.goalContributions], async () => {
    const contribution = await db.goalContributions.get(id)
    if (!contribution) return
    const goal = await db.goals.get(contribution.goalId)
    await db.goalContributions.delete(id)
    if (!goal) return
    const nextAmount = Math.max(0, goal.currentAmount - contribution.amount)
    await db.goals.update(goal.id, {
      currentAmount: nextAmount,
      status: goal.status === 'achieved' && nextAmount < goal.targetAmount ? 'active' : goal.status,
      updatedAt: new Date().toISOString(),
    })
  })
}
