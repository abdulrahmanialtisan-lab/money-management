import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { markSalaryReceivedNow } from '../../db/periodService'
import { useUiStore } from '../../state/uiStore'

interface MarkSalaryReceivedSheetProps {
  open: boolean
  onClose: () => void
  currency: string
  defaultAmount: number
}

export function MarkSalaryReceivedSheet({ open, onClose, currency, defaultAmount }: MarkSalaryReceivedSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setAmount(defaultAmount ? String(defaultAmount) : '')
  }, [open, defaultAmount])

  async function handleConfirm() {
    setSaving(true)
    try {
      await markSalaryReceivedNow(Number(amount) || undefined)
      showToast(t('toast.salaryReceived'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('settings.markReceived')}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{t('settings.markReceivedHint')}</p>
        <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />
        <Pill variant="dark" className="w-full" onClick={handleConfirm} disabled={saving}>
          {t('common.confirm')}
        </Pill>
      </div>
    </Sheet>
  )
}
