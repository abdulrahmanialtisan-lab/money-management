import { z } from 'zod'
import type { Commitment, PayPeriod, Settings, SpendingItem, Transaction } from '../domain/types'
import { db, SCHEMA_VERSION } from './db'

export interface BackupPayload {
  schemaVersion: number
  exportedAt: string
  settings: Settings | null
  commitments: Commitment[]
  spendingItems: SpendingItem[]
  transactions: Transaction[]
  payPeriods: PayPeriod[]
}

const backupSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  settings: z.record(z.string(), z.unknown()).nullable(),
  commitments: z.array(z.record(z.string(), z.unknown())),
  spendingItems: z.array(z.record(z.string(), z.unknown())),
  transactions: z.array(z.record(z.string(), z.unknown())),
  payPeriods: z.array(z.record(z.string(), z.unknown())),
})

export async function exportAllData(): Promise<string> {
  const [settingsRows, commitments, spendingItems, transactions, payPeriods] = await Promise.all([
    db.settings.toArray(),
    db.commitments.toArray(),
    db.spendingItems.toArray(),
    db.transactions.toArray(),
    db.payPeriods.toArray(),
  ])

  const payload: BackupPayload = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingsRows[0] ?? null,
    commitments,
    spendingItems,
    transactions,
    payPeriods,
  }
  return JSON.stringify(payload, null, 2)
}

export async function importAllData(json: string): Promise<void> {
  const parsed = backupSchema.parse(JSON.parse(json))

  await db.transaction(
    'rw',
    [db.settings, db.commitments, db.spendingItems, db.transactions, db.payPeriods],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.commitments.clear(),
        db.spendingItems.clear(),
        db.transactions.clear(),
        db.payPeriods.clear(),
      ])
      if (parsed.settings) await db.settings.put(parsed.settings as unknown as Settings)
      if (parsed.commitments.length) await db.commitments.bulkAdd(parsed.commitments as unknown as Commitment[])
      if (parsed.spendingItems.length) await db.spendingItems.bulkAdd(parsed.spendingItems as unknown as SpendingItem[])
      if (parsed.transactions.length) await db.transactions.bulkAdd(parsed.transactions as unknown as Transaction[])
      if (parsed.payPeriods.length) await db.payPeriods.bulkAdd(parsed.payPeriods as unknown as PayPeriod[])
    },
  )
}

export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.settings, db.commitments, db.spendingItems, db.transactions, db.payPeriods],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.commitments.clear(),
        db.spendingItems.clear(),
        db.transactions.clear(),
        db.payPeriods.clear(),
      ])
    },
  )
}

export function downloadBackupFile(json: string, filename?: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `payday-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
