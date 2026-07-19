import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { contributeToGoal } from '../../db/goals'
import { useUiStore } from '../../state/uiStore'
import { computeSuggestedWeeklyContribution } from '../../domain/goals'
import { formatAmount } from '../../utils/currency'
import { today } from '../../utils/date'
import type { Goal } from '../../domain/types'

interface ContributeToGoalSheetProps {
  open: boolean
  onClose: () => void
  goal?: Goal
  currency: string
  language: 'en' | 'ar'
}

export function ContributeToGoalSheet({ open, onClose, goal, currency, language }: ContributeToGoalSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setAmount('')
  }, [open])

  if (!goal) return null

  const suggested = computeSuggestedWeeklyContribution(goal, today())

  async function handleSave() {
    if (!goal || !Number(amount)) return
    setSaving(true)
    try {
      await contributeToGoal(goal.id, Number(amount))
      showToast(t('toast.contributionSaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('goals.contribute', { name: goal.name })}>
      <div className="space-y-4">
        <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />

        {suggested !== null && (
          <button
            type="button"
            onClick={() => setAmount(String(Math.round(suggested * 100) / 100))}
            className="w-full rounded-2xl bg-accent-soft px-4 py-3 text-start text-sm text-accent-strong"
          >
            {t('goals.suggestedWeekly', { amount: formatAmount(suggested, currency, language) })}
          </button>
        )}

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!Number(amount) || saving}>
          {t('goals.addContribution')}
        </Pill>
      </div>
    </Sheet>
  )
}
