import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '../../components/ui/Sheet'
import { TextField } from '../../components/ui/TextField'
import { Pill } from '../../components/ui/Pill'
import { IconPicker } from '../../components/ui/IconPicker'
import { ColorSwatchPicker } from '../../components/ui/ColorSwatchPicker'
import { upsertCategory, archiveCategory } from '../../db/categories'
import { useUiStore } from '../../state/uiStore'
import { DEFAULT_COLOR, DEFAULT_ICON } from '../../icons/categoryIcons'
import type { Category } from '../../domain/types'

interface CategoryFormSheetProps {
  open: boolean
  onClose: () => void
  editingCategory?: Category
}

export function CategoryFormSheet({ open, onClose, editingCategory }: CategoryFormSheetProps) {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ICON)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editingCategory?.name ?? '')
    setIcon(editingCategory?.icon ?? DEFAULT_ICON)
    setColor(editingCategory?.color ?? DEFAULT_COLOR)
  }, [open, editingCategory])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await upsertCategory({ id: editingCategory?.id, name: name.trim(), icon, color })
      showToast(t('toast.categorySaved'))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!editingCategory) return
    await archiveCategory(editingCategory.id)
    showToast(t('toast.categoryArchived'))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingCategory ? t('categories.editCategory') : t('categories.addCategory')}>
      <div className="space-y-4">
        <TextField label={t('categories.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('categories.namePlaceholder')} autoFocus />

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

        {editingCategory && (
          <Pill variant="outline" className="w-full" onClick={handleArchive}>
            {t('categories.archive')}
          </Pill>
        )}
      </div>
    </Sheet>
  )
}
