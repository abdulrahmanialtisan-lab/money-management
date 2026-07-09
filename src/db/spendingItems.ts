import type { Importance } from '../domain/types'
import { makeId } from '../utils/id'
import { db } from './db'

export interface UpsertSpendingItemInput {
  id?: string
  name: string
  importance: Importance
  icon: string
  color: string
}

export async function upsertSpendingItem(input: UpsertSpendingItemInput): Promise<string> {
  const now = new Date().toISOString()
  if (input.id) {
    await db.spendingItems.update(input.id, {
      name: input.name,
      importance: input.importance,
      icon: input.icon,
      color: input.color,
      updatedAt: now,
    })
    return input.id
  }
  const id = makeId()
  await db.spendingItems.add({
    id,
    name: input.name,
    importance: input.importance,
    icon: input.icon,
    color: input.color,
    usageCount: 0,
    archived: false,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function archiveSpendingItem(id: string): Promise<void> {
  await db.spendingItems.update(id, { archived: true, updatedAt: new Date().toISOString() })
}

export async function deleteSpendingItem(id: string): Promise<void> {
  await db.spendingItems.delete(id)
}
