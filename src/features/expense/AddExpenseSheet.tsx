import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { AmountInput } from '../../components/ui/AmountInput'
import { Pill } from '../../components/ui/Pill'
import { TextField } from '../../components/ui/TextField'
import { SearchableCombobox, type ComboboxItem } from '../../components/ui/SearchableCombobox'
import { useUiStore } from '../../state/uiStore'
import { useSettingsState, useSpendingItems } from '../../state/settingsQueries'
import { addTransaction } from '../../db/transactions'
import { COLOR_SWATCHES, DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { today } from '../../utils/date'
import type { Importance } from '../../domain/types'

type Step = 'pick' | 'newItem'

// Quick-add items skip the icon/color picker: important -> the same green as the
// verdict color, not important -> the same red. Full customization stays in the
// Items library, reachable later without losing this expense's classification.
function colorForImportance(importance: Importance): string {
  return importance === 'important' ? COLOR_SWATCHES[0] : COLOR_SWATCHES[1]
}

export function AddExpenseSheet() {
  const { t } = useTranslation()
  const open = useUiStore((s) => s.addExpenseOpen)
  const prefillItemId = useUiStore((s) => s.prefillItemId)
  const close = useUiStore((s) => s.closeAddExpense)
  const showToast = useUiStore((s) => s.showToast)
  const settingsState = useSettingsState()
  const items = useSpendingItems()

  const [step, setStep] = useState<Step>('pick')
  const [amount, setAmount] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemImportance, setNewItemImportance] = useState<Importance>('important')
  const [saving, setSaving] = useState(false)

  const currency = settingsState !== 'loading' && settingsState !== 'not-found' ? settingsState.currency : ''

  const comboItems: ComboboxItem[] = useMemo(
    () =>
      (items ?? []).map((item) => {
        const Icon = ICONS[item.icon] ?? ICONS[DEFAULT_ICON]
        return {
          id: item.id,
          label: item.name,
          sublabel: item.importance === 'important' ? t('common.important') : t('common.notImportant'),
          icon: <Icon size={16} color={item.color} />,
          color: `${item.color}22`,
        }
      }),
    [items, t],
  )

  function reset() {
    setStep('pick')
    setAmount('')
    setSelectedItemId(undefined)
    setDate(today())
    setNote('')
    setNewItemName('')
    setNewItemImportance('important')
  }

  function handleClose() {
    close()
    reset()
  }

  function handleCreateNew(query: string) {
    setNewItemName(query)
    setStep('newItem')
  }

  function confirmNewItem() {
    setStep('pick')
  }

  useEffect(() => {
    if (open && prefillItemId) setSelectedItemId(prefillItemId)
  }, [open, prefillItemId])

  const canSave = Number(amount) > 0 && (selectedItemId || (step !== 'newItem' && newItemName.trim()))

  async function handleSave() {
    if (!Number(amount)) return
    setSaving(true)
    try {
      if (selectedItemId) {
        await addTransaction({ amount: Number(amount), date, note: note.trim() || undefined, spendingItemId: selectedItemId })
      } else if (newItemName.trim()) {
        await addTransaction({
          amount: Number(amount),
          date,
          note: note.trim() || undefined,
          newItem: {
            name: newItemName.trim(),
            importance: newItemImportance,
            icon: DEFAULT_ICON,
            color: colorForImportance(newItemImportance),
          },
        })
      } else {
        setSaving(false)
        return
      }
      showToast(t('toast.expenseAdded'))
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title={t('expense.addExpense')}>
      <div className="space-y-5">
        <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />

        {step === 'pick' && (
          <div>
            <span className="mb-2 block text-sm font-medium text-ink-soft">{t('expense.chooseItem')}</span>
            {selectedItemId ? (
              <SelectedItemChip
                item={comboItems.find((c) => c.id === selectedItemId)}
                onClear={() => setSelectedItemId(undefined)}
              />
            ) : newItemName.trim() ? (
              <SelectedItemChip
                item={{
                  id: 'pending-new-item',
                  label: newItemName.trim(),
                  sublabel: newItemImportance === 'important' ? t('common.important') : t('common.notImportant'),
                  icon: (() => {
                    const Icon = ICONS[DEFAULT_ICON]
                    return <Icon size={16} color={colorForImportance(newItemImportance)} />
                  })(),
                  color: `${colorForImportance(newItemImportance)}22`,
                }}
                onClear={() => setNewItemName('')}
                onEditLabel={t('common.edit')}
                onEdit={() => setStep('newItem')}
              />
            ) : (
              <SearchableCombobox items={comboItems} selectedId={selectedItemId} onSelect={setSelectedItemId} onCreateNew={handleCreateNew} />
            )}
          </div>
        )}

        {step === 'newItem' && (
          <div className="space-y-4 rounded-2xl border border-border p-4">
            <TextField
              label={t('items.name')}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={t('items.namePlaceholder')}
              autoFocus
            />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.importance')}</span>
              <div className="flex gap-2">
                <Pill
                  variant={newItemImportance === 'important' ? 'accent' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewItemImportance('important')}
                >
                  {t('common.important')}
                </Pill>
                <Pill
                  variant={newItemImportance === 'not_important' ? 'dark' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewItemImportance('not_important')}
                >
                  {t('common.notImportant')}
                </Pill>
              </div>
            </div>
            <div className="flex gap-2">
              <Pill
                variant="outline"
                onClick={() => {
                  setNewItemName('')
                  setStep('pick')
                }}
              >
                {t('common.cancel')}
              </Pill>
              <Pill variant="dark" className="flex-1" onClick={confirmNewItem} disabled={!newItemName.trim()}>
                {t('common.confirm')}
              </Pill>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TextField label={t('expense.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <TextField
            label={t('expense.note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('expense.notePlaceholder')}
          />
        </div>

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!canSave || saving}>
          {t('expense.save')}
        </Pill>
      </div>
    </Sheet>
  )
}

function SelectedItemChip({
  item,
  onClear,
  onEdit,
  onEditLabel,
}: {
  item?: ComboboxItem
  onClear: () => void
  onEdit?: () => void
  onEditLabel?: string
}) {
  const { t } = useTranslation()
  if (!item) return null
  return (
    <div className="flex items-center justify-between rounded-2xl bg-accent-soft px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: item.color }}>
          {item.icon}
        </span>
        <div>
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted">{item.sublabel}</p>
        </div>
      </div>
      <button type="button" onClick={onEdit ?? onClear} className="text-xs font-medium text-accent-strong">
        {onEditLabel ?? t('common.edit')}
      </button>
    </div>
  )
}
