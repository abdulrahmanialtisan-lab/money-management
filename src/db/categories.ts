import { makeId } from '../utils/id'
import { db } from './db'

export interface UpsertCategoryInput {
  id?: string
  name: string
  icon: string
  color: string
}

const DEFAULT_CATEGORIES_EN: Array<Omit<UpsertCategoryInput, 'id'>> = [
  { name: 'Food & Groceries', icon: 'food', color: '#f5a623' },
  { name: 'Transport', icon: 'car', color: '#4a90e2' },
  { name: 'Bills & Utilities', icon: 'receipt', color: '#e35c4d' },
  { name: 'Shopping', icon: 'shopping', color: '#9b59b6' },
  { name: 'Health', icon: 'health', color: '#16a3a8' },
  { name: 'Entertainment', icon: 'film', color: '#e0559c' },
  { name: 'Other', icon: 'other', color: '#8a8a86' },
]

const DEFAULT_CATEGORIES_AR: Array<Omit<UpsertCategoryInput, 'id'>> = [
  { name: 'طعام وبقالة', icon: 'food', color: '#f5a623' },
  { name: 'مواصلات', icon: 'car', color: '#4a90e2' },
  { name: 'فواتير وخدمات', icon: 'receipt', color: '#e35c4d' },
  { name: 'تسوق', icon: 'shopping', color: '#9b59b6' },
  { name: 'صحة', icon: 'health', color: '#16a3a8' },
  { name: 'ترفيه', icon: 'film', color: '#e0559c' },
  { name: 'أخرى', icon: 'other', color: '#8a8a86' },
]

/** Idempotent: only seeds once, first time the app runs with no categories yet. */
export async function seedDefaultCategoriesIfNeeded(language: 'en' | 'ar'): Promise<void> {
  const count = await db.categories.count()
  if (count > 0) return
  const now = new Date().toISOString()
  const defaults = language === 'ar' ? DEFAULT_CATEGORIES_AR : DEFAULT_CATEGORIES_EN
  await db.categories.bulkAdd(
    defaults.map((c) => ({
      id: makeId(),
      name: c.name,
      icon: c.icon,
      color: c.color,
      archived: false,
      createdAt: now,
      updatedAt: now,
    })),
  )
}

export async function upsertCategory(input: UpsertCategoryInput): Promise<string> {
  const now = new Date().toISOString()
  if (input.id) {
    await db.categories.update(input.id, { name: input.name, icon: input.icon, color: input.color, updatedAt: now })
    return input.id
  }
  const id = makeId()
  await db.categories.add({ id, name: input.name, icon: input.icon, color: input.color, archived: false, createdAt: now, updatedAt: now })
  return id
}

export async function archiveCategory(id: string): Promise<void> {
  await db.categories.update(id, { archived: true, updatedAt: new Date().toISOString() })
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', [db.categories, db.spendingItems], async () => {
    const items = await db.spendingItems.where('categoryId').equals(id).toArray()
    await Promise.all(items.map((item) => db.spendingItems.update(item.id, { categoryId: undefined })))
    await db.categories.delete(id)
  })
}
