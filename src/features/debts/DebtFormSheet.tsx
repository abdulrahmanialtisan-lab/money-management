import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { TextField } from '../../components/ui/TextField'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { upsertDebt, deleteDebt } from '../../db/debts'
import { useUiStore } from '../../state/uiStore'
import type { Debt, DebtType } from '../../domain/types'

interface DebtFormSheetProps {
  open: boolean
  onClose: () => void
  editingDebt?: Debt
  currency: string
}

export function DebtFormSheet({ open, onClose, editingDebt, currency }: DebtFormSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)

  const [name, setName] = useState('')
  const [type, setType] = useState<DebtType>('owed_to_me')
  const [counterpartyName, setCounterpartyName] = useState('')
  const [principalAmount, setPrincipalAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editingDebt?.name ?? '')
    setType(editingDebt?.type ?? 'owed_to_me')
    setCounterpartyName(editingDebt?.counterpartyName ?? '')
    setPrincipalAmount(editingDebt ? String(editingDebt.principalAmount) : '')
    setDueDate(editingDebt?.dueDate ?? '')
  }, [open, editingDebt])

  async function handleSave() {
    if (!name.trim() || !Number(principalAmount)) return
    setSaving(true)
    try {
      await upsertDebt({
        id: editingDebt?.id,
        name: name.trim(),
        type,
        counterpartyName: counterpartyName.trim() || undefined,
        principalAmount: Number(principalAmount),
        dueDate: dueDate || undefined,
      })
      showToast(t('toast.debtSaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingDebt) return
    await deleteDebt(editingDebt.id)
    showToast(t('toast.debtDeleted'))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingDebt ? t('debts.editDebt') : t('debts.addDebt')}>
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('debts.type')}</span>
          <div className="flex gap-2">
            <Pill variant={type === 'owed_to_me' ? 'accent' : 'outline'} className="flex-1" onClick={() => setType('owed_to_me')}>
              {t('debts.owedToMe')}
            </Pill>
            <Pill variant={type === 'owed_by_me' ? 'dark' : 'outline'} className="flex-1" onClick={() => setType('owed_by_me')}>
              {t('debts.owedByMe')}
            </Pill>
          </div>
        </div>

        <TextField label={t('debts.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('debts.namePlaceholder')} autoFocus />
        <TextField
          label={t('debts.counterparty')}
          value={counterpartyName}
          onChange={(e) => setCounterpartyName(e.target.value)}
          placeholder={t('debts.counterpartyPlaceholder')}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('debts.principalAmount')}</span>
          <AmountInput value={principalAmount} onChange={setPrincipalAmount} currency={currency} />
        </div>

        <TextField label={t('debts.dueDate')} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!name.trim() || !Number(principalAmount) || saving}>
          {t('common.save')}
        </Pill>

        {editingDebt && (
          <Pill variant="outline" className="w-full text-danger-strong" onClick={handleDelete}>
            {t('common.delete')}
          </Pill>
        )}
      </div>
    </Sheet>
  )
}
