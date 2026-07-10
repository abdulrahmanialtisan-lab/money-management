import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Wallet } from 'lucide-react'
import { updateSettings } from '../../db/db'
import { AddSalaryToBankSheet } from './AddSalaryToBankSheet'

interface BankBalanceCardProps {
  bankBalance: number
  currency: string
  defaultSalaryAmount: number
}

export function BankBalanceCard({ bankBalance, currency, defaultSalaryAmount }: BankBalanceCardProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<string | null>(null)
  const [addSalaryOpen, setAddSalaryOpen] = useState(false)

  async function handleBlur() {
    if (draft === null) return
    const value = Number(draft)
    if (!Number.isNaN(value) && value >= 0) {
      await updateSettings({ bankBalance: value })
    }
    setDraft(null)
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
        <Wallet size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{t('home.bankBalance')}</p>
        <div className="flex items-baseline gap-1">
          <input
            inputMode="decimal"
            value={draft ?? String(bankBalance || '')}
            onChange={(e) => {
              const next = e.target.value.replace(/[^0-9.]/g, '')
              if ((next.match(/\./g) || []).length > 1) return
              setDraft(next)
            }}
            onBlur={handleBlur}
            placeholder="0.00"
            className="w-full min-w-0 bg-transparent text-lg font-bold outline-none placeholder:text-muted"
          />
          <span className="shrink-0 text-xs font-medium text-muted">{currency}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAddSalaryOpen(true)}
        aria-label={t('home.addSalaryToBank')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[#0b0f0d]"
      >
        <Plus size={18} />
      </button>

      <AddSalaryToBankSheet
        open={addSalaryOpen}
        onClose={() => setAddSalaryOpen(false)}
        currency={currency}
        defaultAmount={defaultSalaryAmount}
      />
    </div>
  )
}
