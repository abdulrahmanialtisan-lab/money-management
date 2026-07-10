import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { Pill } from '../../components/ui/Pill'
import { TextField } from '../../components/ui/TextField'
import { useSettingsState, useSpendingItem, useTransaction } from '../../state/settingsQueries'
import { useUiStore } from '../../state/uiStore'
import { deleteTransaction, updateTransaction } from '../../db/transactions'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { dateLocale, fromDateKey } from '../../utils/date'
import { cn } from '../../utils/cn'

export function TransactionDetailSheet() {
  const { t } = useTranslation()
  const selectedTransactionId = useUiStore((s) => s.selectedTransactionId)
  const closeTransactionDetail = useUiStore((s) => s.closeTransactionDetail)
  const showToast = useUiStore((s) => s.showToast)
  const settingsState = useSettingsState()
  const tx = useTransaction(selectedTransactionId)
  const item = useSpendingItem(tx?.spendingItemId)

  const [editing, setEditing] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [saving, setSaving] = useState(false)

  const open = !!selectedTransactionId
  if (settingsState === 'loading' || settingsState === 'not-found' || !tx) {
    return (
      <Sheet open={open} onClose={closeTransactionDetail} title={t('expense.details')}>
        <div />
      </Sheet>
    )
  }

  const { currency, language } = settingsState
  const locale = language as 'en' | 'ar'
  const Icon = ICONS[item?.icon ?? DEFAULT_ICON]
  const color = item?.color ?? '#8a8a86'

  const importanceLabel =
    tx.importanceSnapshot === 'important'
      ? t('common.important')
      : tx.importanceSnapshot === 'not_important'
        ? t('common.notImportant')
        : t('common.unclassified')

  function handleClose() {
    setEditing(false)
    closeTransactionDetail()
  }

  function startEditing() {
    setEditDate(tx!.date)
    setEditNote(tx!.note ?? '')
    setEditing(true)
  }

  async function handleSaveEdit() {
    setSaving(true)
    try {
      await updateTransaction(tx!.id, { date: editDate, note: editNote.trim() || undefined })
      showToast(t('toast.expenseUpdated'))
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(t('expense.deleteConfirm'))) return
    await deleteTransaction(tx!.id)
    showToast(t('toast.expenseDeleted'))
    handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title={t('expense.details')}>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}22` }}>
            <Icon size={28} color={color} />
          </span>
          <p className="text-lg font-semibold">{tx.itemNameSnapshot}</p>
          <p className="text-3xl font-bold tabular-nums">{formatAmount(tx.amount, currency, locale)}</p>
        </div>

        {editing ? (
          <div className="space-y-4">
            <TextField label={t('expense.date')} type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <TextField
              label={t('expense.note')}
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder={t('expense.notePlaceholder')}
            />
            <div className="flex gap-2">
              <Pill variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                {t('common.cancel')}
              </Pill>
              <Pill variant="dark" className="flex-1" onClick={handleSaveEdit} disabled={!editDate || saving}>
                {t('common.save')}
              </Pill>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 rounded-2xl bg-surface-2 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t('expense.date')}</span>
                <span className="font-medium">{fromDateKey(tx.date).toLocaleDateString(dateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{t('items.importance')}</span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    tx.importanceSnapshot === 'important' && 'bg-accent-soft text-accent-strong',
                    tx.importanceSnapshot === 'not_important' && 'bg-danger-soft text-danger-strong',
                    tx.importanceSnapshot === 'unclassified' && 'bg-surface text-muted',
                  )}
                >
                  {importanceLabel}
                </span>
              </div>
            </div>

            {tx.note && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink-soft">{t('expense.note')}</p>
                <p className="rounded-2xl bg-surface-2 p-4 text-sm">{tx.note}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Pill variant="outline" className="flex-1" onClick={startEditing}>
                {t('common.edit')}
              </Pill>
              <Pill variant="outline" className="flex-1 text-danger-strong" onClick={handleDelete}>
                {t('common.delete')}
              </Pill>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
