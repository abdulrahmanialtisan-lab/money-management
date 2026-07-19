import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { useDebts, useSettingsState } from '../../state/settingsQueries'
import { computeDebtTotals } from '../../domain/debts'
import { formatAmount } from '../../utils/currency'
import { dateLocale, fromDateKey } from '../../utils/date'
import { DebtFormSheet } from './DebtFormSheet'
import { RecordPaymentSheet } from './RecordPaymentSheet'
import type { Debt } from '../../domain/types'

export function DebtsScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const debts = useDebts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>()
  const [payingDebt, setPayingDebt] = useState<Debt | undefined>()

  if (settingsState === 'loading' || settingsState === 'not-found') return null
  const { currency, language } = settingsState
  const lang = language as 'en' | 'ar'

  const activeDebts = (debts ?? []).filter((d) => d.status === 'active')
  const owedToMe = activeDebts.filter((d) => d.type === 'owed_to_me')
  const owedByMe = activeDebts.filter((d) => d.type === 'owed_by_me')
  const totals = computeDebtTotals(debts ?? [])

  function openNew() {
    setEditingDebt(undefined)
    setFormOpen(true)
  }

  function renderDebtRow(debt: Debt) {
    return (
      <div key={debt.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
        <button type="button" onClick={() => { setEditingDebt(debt); setFormOpen(true) }} className="min-w-0 flex-1 text-start">
          <p className="truncate text-sm font-medium">{debt.name}</p>
          <p className="text-xs text-muted">
            {debt.counterpartyName ? `${debt.counterpartyName} · ` : ''}
            {formatAmount(debt.remainingAmount, currency, lang)}
            {debt.dueDate && ` · ${fromDateKey(debt.dueDate).toLocaleDateString(dateLocale(lang), { month: 'short', day: 'numeric' })}`}
          </p>
        </button>
        <Pill size="sm" variant="outline" onClick={() => setPayingDebt(debt)}>
          {t('debts.pay')}
        </Pill>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ScreenHeader
        title={t('debts.title')}
        subtitle={t('debts.subtitle')}
        action={
          <button type="button" onClick={openNew} aria-label={t('debts.addDebt')} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
            <Plus size={18} />
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Card variant="accent" className="p-4">
          <p className="text-xs text-[#0b0f0d]/70">{t('debts.totalOwedToMe')}</p>
          <p className="mt-1 text-lg font-bold tabular-nums">{formatAmount(totals.totalOwedToMe, currency, lang)}</p>
        </Card>
        <Card variant="dark" className="p-4">
          <p className="text-xs text-white/60">{t('debts.totalOwedByMe')}</p>
          <p className="mt-1 text-lg font-bold tabular-nums">{formatAmount(totals.totalOwedByMe, currency, lang)}</p>
        </Card>
      </div>

      {activeDebts.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm text-muted">{t('debts.empty')}</p>
      ) : (
        <>
          {owedToMe.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-soft">{t('debts.owedToMe')}</p>
              {owedToMe.map(renderDebtRow)}
            </div>
          )}
          {owedByMe.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-soft">{t('debts.owedByMe')}</p>
              {owedByMe.map(renderDebtRow)}
            </div>
          )}
        </>
      )}

      <DebtFormSheet open={formOpen} onClose={() => setFormOpen(false)} editingDebt={editingDebt} currency={currency} />
      <RecordPaymentSheet open={!!payingDebt} onClose={() => setPayingDebt(undefined)} debt={payingDebt} currency={currency} language={lang} />
    </div>
  )
}
