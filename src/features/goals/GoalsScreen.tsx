import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { DonutRing } from '../../components/ui/DonutRing'
import { useGoals, useSettingsState } from '../../state/settingsQueries'
import { computeGoalProgress } from '../../domain/goals'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { dateLocale, fromDateKey } from '../../utils/date'
import { GoalFormSheet } from './GoalFormSheet'
import { ContributeToGoalSheet } from './ContributeToGoalSheet'
import type { Goal } from '../../domain/types'

export function GoalsScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const goals = useGoals()
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()
  const [contributingGoal, setContributingGoal] = useState<Goal | undefined>()

  if (settingsState === 'loading' || settingsState === 'not-found') return null
  const { currency, language } = settingsState

  const activeGoals = (goals ?? []).filter((g) => g.status !== 'archived')
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0)

  function openNew() {
    setEditingGoal(undefined)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ScreenHeader
        title={t('goals.title')}
        subtitle={t('goals.subtitle')}
        action={
          <button type="button" onClick={openNew} aria-label={t('goals.addGoal')} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
            <Plus size={18} />
          </button>
        }
      />

      {activeGoals.length > 0 && (
        <Card variant="dark" className="flex items-center justify-between">
          <span className="text-sm text-white/70">{t('goals.totalSaved')}</span>
          <span className="text-lg font-bold tabular-nums">{formatAmount(totalSaved, currency, language as 'en' | 'ar')}</span>
        </Card>
      )}

      {activeGoals.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm text-muted">{t('goals.empty')}</p>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const Icon = ICONS[goal.icon] ?? ICONS[DEFAULT_ICON]
            const progress = computeGoalProgress(goal)
            return (
              <Card key={goal.id} variant="surface" className="space-y-3">
                <button type="button" onClick={() => { setEditingGoal(goal); setFormOpen(true) }} className="flex w-full items-center gap-4 text-start">
                  <DonutRing value={progress.pct} size={64} strokeWidth={7} tone={progress.isAchieved ? 'accent' : 'accent'}>
                    <Icon size={20} color={goal.color} />
                  </DonutRing>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{goal.name}</p>
                    <p className="text-xs text-muted">
                      {formatAmount(goal.currentAmount, currency, language as 'en' | 'ar')} {t('common.of')} {formatAmount(goal.targetAmount, currency, language as 'en' | 'ar')}
                    </p>
                    {goal.targetDate && (
                      <p className="mt-0.5 text-[11px] text-muted">
                        {t('goals.by')} {fromDateKey(goal.targetDate).toLocaleDateString(dateLocale(language as 'en' | 'ar'), { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-accent-strong">{progress.pct}%</span>
                </button>
                {goal.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => setContributingGoal(goal)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-surface-2 py-2.5 text-sm font-medium text-ink"
                  >
                    <Plus size={14} />
                    {t('goals.addContribution')}
                  </button>
                )}
                {goal.status === 'achieved' && (
                  <p className="rounded-2xl bg-accent-soft px-3 py-2 text-center text-xs font-medium text-accent-strong">{t('goals.achieved')}</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <GoalFormSheet open={formOpen} onClose={() => setFormOpen(false)} editingGoal={editingGoal} currency={currency} />
      <ContributeToGoalSheet
        open={!!contributingGoal}
        onClose={() => setContributingGoal(undefined)}
        goal={contributingGoal}
        currency={currency}
        language={language as 'en' | 'ar'}
      />
    </div>
  )
}
