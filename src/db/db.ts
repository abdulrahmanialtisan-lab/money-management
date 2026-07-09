import Dexie, { type EntityTable } from 'dexie'
import type { Commitment, PayPeriod, Settings, SpendingItem, Transaction } from '../domain/types'
import { dbNameForProfile, getActiveProfile } from './profiles'

export class AppDatabase extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  commitments!: EntityTable<Commitment, 'id'>
  spendingItems!: EntityTable<SpendingItem, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  payPeriods!: EntityTable<PayPeriod, 'id'>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      settings: 'id',
      commitments: 'id, active',
      spendingItems: 'id, importance, archived, name',
      transactions: 'id, date, periodId, spendingItemId',
      payPeriods: 'id, status, startDate',
    })
  }
}

export const db = new AppDatabase(dbNameForProfile(getActiveProfile()))

export const SCHEMA_VERSION = 1

export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  currency: 'SAR',
  language: 'ar',
  theme: 'system',
  payday: 25,
  weekStartDay: 6, // Saturday
  defaultSalaryAmount: 0,
  importantTargetRatio: 50,
  notificationsEnabled: false,
  bankBalance: 0,
  onboardingCompleted: false,
  schemaVersion: SCHEMA_VERSION,
}

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get('singleton')
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await db.settings.update('singleton', patch)
}
