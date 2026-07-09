import type { Importance, ImportanceOrUnclassified } from '../domain/types'
import { today } from '../utils/date'
import { makeId } from '../utils/id'
import { db } from './db'

export interface AddTransactionInput {
  amount: number
  date?: string
  note?: string
  spendingItemId?: string
  newItem?: { name: string; importance: Importance; icon: string; color: string; saveToLibrary: boolean }
}

async function findPeriodIdForDate(date: string): Promise<string> {
  const containing = await db.payPeriods.filter((p) => p.startDate <= date && date <= p.endDate).first()
  if (containing) return containing.id
  const active = await db.payPeriods.where('status').equals('active').first()
  if (active) return active.id
  throw new Error('No pay period exists yet — complete onboarding first')
}

export async function addTransaction(input: AddTransactionInput): Promise<void> {
  const date = input.date ?? today()
  const now = new Date().toISOString()

  let spendingItemId = input.spendingItemId
  let itemName: string
  let importance: ImportanceOrUnclassified

  if (!spendingItemId && input.newItem?.saveToLibrary) {
    const id = makeId()
    await db.spendingItems.add({
      id,
      name: input.newItem.name,
      importance: input.newItem.importance,
      icon: input.newItem.icon,
      color: input.newItem.color,
      usageCount: 1,
      lastUsedAt: now,
      archived: false,
      createdAt: now,
      updatedAt: now,
    })
    spendingItemId = id
    itemName = input.newItem.name
    importance = input.newItem.importance
  } else if (!spendingItemId && input.newItem) {
    // One-off entry: keep the typed name + importance on the transaction only, no library row.
    itemName = input.newItem.name
    importance = input.newItem.importance
  } else if (spendingItemId) {
    const item = await db.spendingItems.get(spendingItemId)
    if (!item) throw new Error('Spending item not found')
    itemName = item.name
    importance = item.importance
    await db.spendingItems.update(spendingItemId, {
      usageCount: item.usageCount + 1,
      lastUsedAt: now,
      updatedAt: now,
    })
  } else {
    itemName = 'Uncategorized'
    importance = 'unclassified'
  }

  const periodId = await findPeriodIdForDate(date)

  await db.transactions.add({
    id: makeId(),
    date,
    amount: input.amount,
    spendingItemId,
    itemNameSnapshot: itemName,
    importanceSnapshot: importance,
    note: input.note,
    periodId,
    createdAt: now,
    updatedAt: now,
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

export async function updateTransaction(
  id: string,
  patch: Partial<{ amount: number; date: string; note: string }>,
): Promise<void> {
  const existing = await db.transactions.get(id)
  if (!existing) return
  let periodId = existing.periodId
  if (patch.date && patch.date !== existing.date) {
    periodId = await findPeriodIdForDate(patch.date)
  }
  await db.transactions.update(id, { ...patch, periodId, updatedAt: new Date().toISOString() })
}
