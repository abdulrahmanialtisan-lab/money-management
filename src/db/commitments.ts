import { makeId } from '../utils/id'
import { db } from './db'

export interface UpsertCommitmentInput {
  id?: string
  name: string
  amount: number
  category?: string
  dueDayOfMonth?: number
  active: boolean
}

export async function upsertCommitment(input: UpsertCommitmentInput): Promise<string> {
  const now = new Date().toISOString()
  if (input.id) {
    await db.commitments.update(input.id, {
      name: input.name,
      amount: input.amount,
      category: input.category,
      dueDayOfMonth: input.dueDayOfMonth,
      active: input.active,
      updatedAt: now,
    })
    return input.id
  }
  const id = makeId()
  await db.commitments.add({
    id,
    name: input.name,
    amount: input.amount,
    category: input.category,
    dueDayOfMonth: input.dueDayOfMonth,
    active: input.active,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function deleteCommitment(id: string): Promise<void> {
  await db.commitments.delete(id)
}

export async function toggleCommitmentActive(id: string, active: boolean): Promise<void> {
  await db.commitments.update(id, { active, updatedAt: new Date().toISOString() })
}
