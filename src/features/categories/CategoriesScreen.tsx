import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { useCategories, useSpendingItems } from '../../state/settingsQueries'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { CategoryFormSheet } from './CategoryFormSheet'
import type { Category } from '../../domain/types'

export function CategoriesScreen() {
  const { t } = useTranslation()
  const categories = useCategories()
  const items = useSpendingItems(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const itemCountByCategory = new Map<string, number>()
  for (const item of items ?? []) {
    if (!item.categoryId) continue
    itemCountByCategory.set(item.categoryId, (itemCountByCategory.get(item.categoryId) ?? 0) + 1)
  }

  function openNew() {
    setEditingCategory(undefined)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ScreenHeader
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        action={
          <button type="button" onClick={openNew} aria-label={t('categories.addCategory')} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
            <Plus size={18} />
          </button>
        }
      />

      {(categories ?? []).length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm text-muted">{t('categories.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(categories ?? []).map((category) => {
            const Icon = ICONS[category.icon] ?? ICONS[DEFAULT_ICON]
            const count = itemCountByCategory.get(category.id) ?? 0
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => openEdit(category)}
                className="flex flex-col items-start gap-2 rounded-2xl bg-surface p-4 text-start"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.color}22` }}>
                  <Icon size={18} color={category.color} />
                </span>
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-[11px] text-muted">{t('categories.itemCount', { count })}</span>
              </button>
            )
          })}
        </div>
      )}

      <CategoryFormSheet open={formOpen} onClose={() => setFormOpen(false)} editingCategory={editingCategory} />
    </div>
  )
}
