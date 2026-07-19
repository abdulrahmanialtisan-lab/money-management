import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { TextField } from '../../components/ui/TextField'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { IconPicker } from '../../components/ui/IconPicker'
import { ColorSwatchPicker } from '../../components/ui/ColorSwatchPicker'
import { upsertGoal, deleteGoal } from '../../db/goals'
import { useUiStore } from '../../state/uiStore'
import { DEFAULT_COLOR, DEFAULT_ICON } from '../../icons/categoryIcons'
import type { Goal } from '../../domain/types'

interface GoalFormSheetProps {
  open: boolean
  onClose: () => void
  editingGoal?: Goal
  currency: string
}

export function GoalFormSheet({ open, onClose, editingGoal, currency }: GoalFormSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ICON)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editingGoal?.name ?? '')
    setTargetAmount(editingGoal ? String(editingGoal.targetAmount) : '')
    setTargetDate(editingGoal?.targetDate ?? '')
    setIcon(editingGoal?.icon ?? DEFAULT_ICON)
    setColor(editingGoal?.color ?? DEFAULT_COLOR)
  }, [open, editingGoal])

  async function handleSave() {
    if (!name.trim() || !Number(targetAmount)) return
    setSaving(true)
    try {
      await upsertGoal({
        id: editingGoal?.id,
        name: name.trim(),
        targetAmount: Number(targetAmount),
        icon,
        color,
        targetDate: targetDate || undefined,
      })
      showToast(t('toast.goalSaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingGoal) return
    await deleteGoal(editingGoal.id)
    showToast(t('toast.goalDeleted'))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingGoal ? t('goals.editGoal') : t('goals.addGoal')}>
      <div className="space-y-4">
        <TextField label={t('goals.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('goals.namePlaceholder')} autoFocus />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('goals.targetAmount')}</span>
          <AmountInput value={targetAmount} onChange={setTargetAmount} currency={currency} />
        </div>

        <TextField label={t('goals.targetDate')} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.icon')}</span>
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.color')}</span>
          <ColorSwatchPicker value={color} onChange={setColor} />
        </div>

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!name.trim() || !Number(targetAmount) || saving}>
          {t('common.save')}
        </Pill>

        {editingGoal && (
          <Pill variant="outline" className="w-full text-danger-strong" onClick={handleDelete}>
            {t('common.delete')}
          </Pill>
        )}
      </div>
    </Sheet>
  )
}
