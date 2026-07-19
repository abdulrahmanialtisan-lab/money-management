import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { recordDebtPayment } from '../../db/debts'
import { useUiStore } from '../../state/uiStore'
import { formatAmount } from '../../utils/currency'
import type { Debt } from '../../domain/types'

interface RecordPaymentSheetProps {
  open: boolean
  onClose: () => void
  debt?: Debt
  currency: string
  language: 'en' | 'ar'
}

export function RecordPaymentSheet({ open, onClose, debt, currency, language }: RecordPaymentSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setAmount(debt ? String(debt.remainingAmount) : '')
  }, [open, debt])

  if (!debt) return null

  async function handleSave() {
    if (!debt || !Number(amount)) return
    setSaving(true)
    try {
      await recordDebtPayment(debt.id, Number(amount))
      showToast(t('toast.paymentRecorded'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('debts.recordPayment', { name: debt.name })}>
      <div className="space-y-4">
        <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />
        <p className="text-xs text-muted">{t('debts.remainingHint', { amount: formatAmount(debt.remainingAmount, currency, language) })}</p>
        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!Number(amount) || saving}>
          {t('debts.recordPaymentAction')}
        </Pill>
      </div>
    </Sheet>
  )
}
