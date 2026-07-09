import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Toggle } from '../../components/ui/Toggle'
import { useCommitments, useSettingsState } from '../../state/settingsQueries'
import { toggleCommitmentActive } from '../../db/commitments'
import { recalculateActivePeriodCommitments } from '../../db/periodService'
import { useUiStore } from '../../state/uiStore'
import { formatAmount } from '../../utils/currency'
import { CommitmentFormSheet } from './CommitmentFormSheet'
import type { Commitment } from '../../domain/types'

export function CommitmentsScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const commitments = useCommitments()
  const showToast = useUiStore((s) => s.showToast)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Commitment | undefined>()

  if (settingsState === 'loading' || settingsState === 'not-found') return null
  const { currency, language } = settingsState

  const total = (commitments ?? []).filter((c) => c.active).reduce((sum, c) => sum + c.amount, 0)

  function openNew() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(c: Commitment) {
    setEditing(c)
    setFormOpen(true)
  }

  async function handleRecalculate() {
    await recalculateActivePeriodCommitments()
    showToast(t('toast.commitmentSaved'))
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ScreenHeader
        title={t('commitments.title')}
        subtitle={t('commitments.subtitle')}
        action={
          <button type="button" onClick={openNew} aria-label={t('commitments.addCommitment')} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
            <Plus size={18} />
          </button>
        }
      />

      <Card variant="dark" className="flex items-center justify-between">
        <span className="text-sm text-white/70">{t('commitments.totalMonthly')}</span>
        <span className="text-lg font-bold tabular-nums">{formatAmount(total, currency, language as 'en' | 'ar')}</span>
      </Card>

      {(commitments ?? []).length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm text-muted">{t('commitments.empty')}</p>
      ) : (
        <div className="space-y-2">
          {(commitments ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <button type="button" onClick={() => openEdit(c)} className="min-w-0 flex-1 text-start">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted">{formatAmount(c.amount, currency, language as 'en' | 'ar')}</p>
              </button>
              <Toggle checked={c.active} onChange={(v) => toggleCommitmentActive(c.id, v)} />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted">{t('commitments.inactiveHint')}</p>

      <Pill variant="outline" className="w-full" onClick={handleRecalculate}>
        {t('commitments.recalculate')}
      </Pill>
      <p className="-mt-2 text-xs text-muted">{t('commitments.recalculateHint')}</p>

      <CommitmentFormSheet open={formOpen} onClose={() => setFormOpen(false)} editingCommitment={editing} currency={currency} />
    </div>
  )
}
