import type { DebtType } from '../domain/types'
import { makeId } from '../utils/id'
import { today } from '../utils/date'
import { db } from './db'

export interface UpsertDebtInput {
  id?: string
  name: string
  type: DebtType
  counterpartyName?: string
  principalAmount: number
  dueDate?: string
  notes?: string
}

export async function upsertDebt(input: UpsertDebtInput): Promise<string> {
  const now = new Date().toISOString()
  if (input.id) {
    const existing = await db.debts.get(input.id)
    if (!existing) throw new Error('Debt not found')
    // Editing the principal shifts remaining by the same delta so recorded payments aren't lost.
    const alreadyPaid = existing.principalAmount - existing.remainingAmount
    const remainingAmount = Math.max(0, input.principalAmount - alreadyPaid)
    await db.debts.update(input.id, {
      name: input.name,
      type: input.type,
      counterpartyName: input.counterpartyName,
      principalAmount: input.principalAmount,
      remainingAmount,
      dueDate: input.dueDate,
      notes: input.notes,
      status: remainingAmount <= 0 ? 'settled' : 'active',
      updatedAt: now,
    })
    return input.id
  }
  const id = makeId()
  await db.debts.add({
    id,
    name: input.name,
    type: input.type,
    counterpartyName: input.counterpartyName,
    principalAmount: input.principalAmount,
    remainingAmount: input.principalAmount,
    dueDate: input.dueDate,
    notes: input.notes,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function deleteDebt(id: string): Promise<void> {
  await db.transaction('rw', [db.debts, db.debtPayments], async () => {
    await db.debtPayments.where('debtId').equals(id).delete()
    await db.debts.delete(id)
  })
}

export async function recordDebtPayment(debtId: string, amount: number, date?: string, note?: string): Promise<void> {
  if (amount <= 0) return
  const now = new Date().toISOString()
  await db.transaction('rw', [db.debts, db.debtPayments], async () => {
    const debt = await db.debts.get(debtId)
    if (!debt) return
    const remainingAmount = Math.max(0, debt.remainingAmount - amount)
    await db.debts.update(debtId, {
      remainingAmount,
      status: remainingAmount <= 0 ? 'settled' : 'active',
      updatedAt: now,
    })
    await db.debtPayments.add({ id: makeId(), debtId, amount, date: date ?? today(), note, createdAt: now })
  })
}

export async function deleteDebtPayment(id: string): Promise<void> {
  await db.transaction('rw', [db.debts, db.debtPayments], async () => {
    const payment = await db.debtPayments.get(id)
    if (!payment) return
    const debt = await db.debts.get(payment.debtId)
    await db.debtPayments.delete(id)
    if (!debt) return
    const remainingAmount = Math.min(debt.principalAmount, debt.remainingAmount + payment.amount)
    await db.debts.update(debt.id, {
      remainingAmount,
      status: remainingAmount <= 0 ? 'settled' : 'active',
      updatedAt: new Date().toISOString(),
    })
  })
}
