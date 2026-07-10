import { db } from './db'

export async function adjustBankBalance(delta: number): Promise<void> {
  const settings = await db.settings.get('singleton')
  if (!settings) return
  await db.settings.update('singleton', { bankBalance: (settings.bankBalance ?? 0) + delta })
}

export async function addSalaryToBankBalance(amount: number): Promise<void> {
  await adjustBankBalance(amount)
}
