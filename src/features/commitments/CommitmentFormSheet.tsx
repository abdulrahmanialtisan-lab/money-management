import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { TextField } from '../../components/ui/TextField'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { Toggle } from '../../components/ui/Toggle'
import { upsertCommitment, deleteCommitment } from '../../db/commitments'
import { useUiStore } from '../../state/uiStore'
import type { Commitment } from '../../domain/types'

interface CommitmentFormSheetProps {
  open: boolean
  onClose: () => void
  editingCommitment?: Commitment
  currency: string
}

export function CommitmentFormSheet({ open, onClose, editingCommitment, currency }: CommitmentFormSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editingCommitment?.name ?? '')
    setAmount(editingCommitment ? String(editingCommitment.amount) : '')
    setActive(editingCommitment?.active ?? true)
  }, [open, editingCommitment])

  async function handleSave() {
    if (!name.trim() || !Number(amount)) return
    setSaving(true)
    try {
      await upsertCommitment({ id: editingCommitment?.id, name: name.trim(), amount: Number(amount), active })
      showToast(t('toast.commitmentSaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingCommitment) return
    await deleteCommitment(editingCommitment.id)
    showToast(t('toast.commitmentDeleted'))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingCommitment ? t('commitments.editCommitment') : t('commitments.addCommitment')}>
      <div className="space-y-4">
        <TextField label={t('commitments.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('commitments.namePlaceholder')} autoFocus />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('commitments.amount')}</span>
          <AmountInput value={amount} onChange={setAmount} currency={currency} />
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
          <span className="text-sm font-medium">{t('commitments.active')}</span>
          <Toggle checked={active} onChange={setActive} />
        </div>

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!name.trim() || !Number(amount) || saving}>
          {t('common.save')}
        </Pill>

        {editingCommitment && (
          <Pill variant="outline" className="w-full text-danger-strong" onClick={handleDelete}>
            {t('common.delete')}
          </Pill>
        )}
      </div>
    </Sheet>
  )
}
