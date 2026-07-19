import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { TextField } from '../../components/ui/TextField'
import { Pill } from '../../components/ui/Pill'
import { IconPicker } from '../../components/ui/IconPicker'
import { ColorSwatchPicker } from '../../components/ui/ColorSwatchPicker'
import { upsertSpendingItem, archiveSpendingItem, deleteSpendingItem } from '../../db/spendingItems'
import { useUiStore } from '../../state/uiStore'
import { useCategories } from '../../state/settingsQueries'
import { DEFAULT_COLOR, DEFAULT_ICON } from '../../icons/categoryIcons'
import type { Importance, SpendingItem } from '../../domain/types'

interface ItemFormSheetProps {
  open: boolean
  onClose: () => void
  editingItem?: SpendingItem
}

export function ItemFormSheet({ open, onClose, editingItem }: ItemFormSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const categories = useCategories()

  const [name, setName] = useState('')
  const [importance, setImportance] = useState<Importance>('important')
  const [icon, setIcon] = useState(DEFAULT_ICON)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editingItem?.name ?? '')
    setImportance(editingItem?.importance ?? 'important')
    setIcon(editingItem?.icon ?? DEFAULT_ICON)
    setColor(editingItem?.color ?? DEFAULT_COLOR)
    setCategoryId(editingItem?.categoryId)
  }, [open, editingItem])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await upsertSpendingItem({ id: editingItem?.id, name: name.trim(), importance, icon, color, categoryId })
      showToast(t('toast.itemSaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!editingItem) return
    await archiveSpendingItem(editingItem.id)
    showToast(t('toast.itemArchived'))
    onClose()
  }

  async function handleDelete() {
    if (!editingItem) return
    await deleteSpendingItem(editingItem.id)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingItem ? t('items.editItem') : t('items.addItem')}>
      <div className="space-y-4">
        <TextField label={t('items.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('items.namePlaceholder')} autoFocus />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.importance')}</span>
          <div className="flex gap-2">
            <Pill variant={importance === 'important' ? 'accent' : 'outline'} className="flex-1" onClick={() => setImportance('important')}>
              {t('common.important')}
            </Pill>
            <Pill variant={importance === 'not_important' ? 'dark' : 'outline'} className="flex-1" onClick={() => setImportance('not_important')}>
              {t('common.notImportant')}
            </Pill>
          </div>
        </div>

        {(categories ?? []).length > 0 && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('categories.title')}</span>
            <div className="flex flex-wrap gap-2">
              <Pill size="sm" variant={!categoryId ? 'dark' : 'outline'} onClick={() => setCategoryId(undefined)}>
                {t('categories.none')}
              </Pill>
              {(categories ?? []).map((category) => (
                <Pill
                  key={category.id}
                  size="sm"
                  variant={categoryId === category.id ? 'dark' : 'outline'}
                  onClick={() => setCategoryId(category.id)}
                >
                  {category.name}
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.icon')}</span>
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('items.color')}</span>
          <ColorSwatchPicker value={color} onChange={setColor} />
        </div>

        <Pill variant="dark" className="w-full" onClick={handleSave} disabled={!name.trim() || saving}>
          {t('common.save')}
        </Pill>

        {editingItem && (
          <div className="flex gap-2">
            <Pill variant="outline" className="flex-1" onClick={handleArchive}>
              {t('items.archive')}
            </Pill>
            <Pill variant="outline" className="flex-1 text-danger-strong" onClick={handleDelete}>
              {t('common.delete')}
            </Pill>
          </div>
        )}
      </div>
    </Sheet>
  )
}
