import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { addSalaryToBankBalance } from '../../db/bankBalance'
import { useUiStore } from '../../state/uiStore'

interface AddSalaryToBankSheetProps {
  open: boolean
  onClose: () => void
  currency: string
  defaultAmount: number
}

export function AddSalaryToBankSheet({ open, onClose, currency, defaultAmount }: AddSalaryToBankSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setAmount(defaultAmount ? String(defaultAmount) : '')
  }, [open, defaultAmount])

  async function handleConfirm() {
    if (!Number(amount)) return
    setSaving(true)
    try {
      await addSalaryToBankBalance(Number(amount))
      showToast(t('toast.salaryAddedToBank'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('home.addSalaryToBank')}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{t('home.addSalaryToBankHint')}</p>
        <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />
        <Pill variant="dark" className="w-full" onClick={handleConfirm} disabled={!Number(amount) || saving}>
          {t('common.confirm')}
        </Pill>
      </div>
    </Sheet>
  )
}
