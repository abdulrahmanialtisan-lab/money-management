import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Select } from '../../components/ui/Select'
import { Toggle } from '../../components/ui/Toggle'
import { AmountInput } from '../../components/ui/AmountInput'
import { updateSettings } from '../../db/db'
import { recalculateActivePeriodCommitments, updateActivePeriodSalary } from '../../db/periodService'
import { applyLanguage } from '../../i18n'
import { computeWeeklyBudgetStreak } from '../../domain/streak'
import { requestNotificationPermission } from '../../lib/notifications'
import { useActivePeriod, useAllPeriods, useSettingsState, useTransactionsForPeriod } from '../../state/settingsQueries'
import { useUiStore } from '../../state/uiStore'
import { SUPPORTED_CURRENCIES } from '../../utils/currency'
import { today } from '../../utils/date'
import { BackupSection } from './BackupSection'
import { ProfileSection } from './ProfileSection'
import { MarkSalaryReceivedSheet } from './MarkSalaryReceivedSheet'

const WEEKDAY_LABELS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_LABELS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function SettingsScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const activePeriod = useActivePeriod()
  const allPeriods = useAllPeriods()
  const activeTransactions = useTransactionsForPeriod(activePeriod?.id)
  const showToast = useUiStore((s) => s.showToast)

  const [salaryDraft, setSalaryDraft] = useState<string | null>(null)
  const [markReceivedOpen, setMarkReceivedOpen] = useState(false)

  if (settingsState === 'loading' || settingsState === 'not-found') return null
  const settings = settingsState
  const weekdayLabels = settings.language === 'ar' ? WEEKDAY_LABELS_AR : WEEKDAY_LABELS_EN

  const activeWeeklyActuals = activePeriod
    ? activePeriod.weeks.map((w) => (activeTransactions ?? []).filter((tx) => tx.date >= w.startDate && tx.date <= w.endDate).reduce((s, tx) => s + tx.amount, 0))
    : []
  const streak = computeWeeklyBudgetStreak(allPeriods ?? [], activePeriod?.id, activeWeeklyActuals, today())

  async function handleSalaryBlur() {
    if (salaryDraft === null) return
    const value = Number(salaryDraft)
    if (!Number.isNaN(value) && value >= 0) {
      await updateSettings({ defaultSalaryAmount: value })
      await updateActivePeriodSalary(value)
    }
    setSalaryDraft(null)
  }

  async function handlePaydayChange(value: string) {
    await updateSettings({ payday: Number(value) })
  }

  async function handleWeekStartChange(value: string) {
    await updateSettings({ weekStartDay: Number(value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
    await recalculateActivePeriodCommitments()
  }

  async function handleCurrencyChange(value: string) {
    await updateSettings({ currency: value })
  }

  async function handleLanguageChange(lang: 'en' | 'ar') {
    applyLanguage(lang)
    await updateSettings({ language: lang })
  }

  async function handleThemeChange(theme: 'light' | 'dark' | 'system') {
    await updateSettings({ theme })
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }

  async function handleTargetRatioChange(value: number) {
    await updateSettings({ importantTargetRatio: value })
  }

  async function handleNotificationsToggle(checked: boolean) {
    if (checked) {
      const granted = await requestNotificationPermission()
      await updateSettings({ notificationsEnabled: granted })
      if (!granted) showToast(t('settings.notificationsHint'))
    } else {
      await updateSettings({ notificationsEnabled: false })
    }
  }

  return (
    <div className="space-y-5 px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      {streak > 0 && (
        <Card variant="accent" className="flex items-center gap-3">
          <Flame size={22} />
          <div>
            <p className="text-sm font-semibold">{t('settings.streakDays', { count: streak })}</p>
          </div>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.salary')}</h2>
        <Card variant="surface" className="space-y-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('settings.salaryAmount')}</span>
            <AmountInput
              value={salaryDraft ?? String(settings.defaultSalaryAmount || '')}
              onChange={setSalaryDraft}
              onBlur={handleSalaryBlur}
              currency={settings.currency}
            />
          </div>
          <Select label={t('settings.payday')} value={String(settings.payday)} onChange={handlePaydayChange} options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
          <Select label={t('settings.weekStart')} value={String(settings.weekStartDay)} onChange={handleWeekStartChange} options={weekdayLabels.map((label, i) => ({ value: String(i), label }))} />
        </Card>
        <Pill variant="outline" className="w-full" onClick={() => setMarkReceivedOpen(true)}>
          {t('settings.markReceived')}
        </Pill>
        <p className="text-xs text-muted">{t('settings.markReceivedHint')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.currency')} / {t('settings.language')} / {t('settings.theme')}</h2>
        <Card variant="surface" className="space-y-3">
          <Select label={t('settings.currency')} value={settings.currency} onChange={handleCurrencyChange} options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))} />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('settings.language')}</span>
            <div className="flex gap-2">
              <Pill variant={settings.language === 'ar' ? 'dark' : 'outline'} className="flex-1" onClick={() => handleLanguageChange('ar')}>
                العربية
              </Pill>
              <Pill variant={settings.language === 'en' ? 'dark' : 'outline'} className="flex-1" onClick={() => handleLanguageChange('en')}>
                English
              </Pill>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('settings.theme')}</span>
            <div className="flex gap-2">
              <Pill variant={settings.theme === 'light' ? 'dark' : 'outline'} size="sm" className="flex-1" onClick={() => handleThemeChange('light')}>
                {t('settings.themeLight')}
              </Pill>
              <Pill variant={settings.theme === 'dark' ? 'dark' : 'outline'} size="sm" className="flex-1" onClick={() => handleThemeChange('dark')}>
                {t('settings.themeDark')}
              </Pill>
              <Pill variant={settings.theme === 'system' ? 'dark' : 'outline'} size="sm" className="flex-1" onClick={() => handleThemeChange('system')}>
                {t('settings.themeSystem')}
              </Pill>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.targetRatio')}</h2>
        <Card variant="surface">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{t('settings.targetRatioHint')}</span>
            <span className="font-semibold tabular-nums">{settings.importantTargetRatio}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.importantTargetRatio}
            onChange={(e) => handleTargetRatioChange(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-accent-strong)]"
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.notifications')}</h2>
        <Card variant="surface" className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('settings.enableNotifications')}</p>
            <p className="text-xs text-muted">{t('settings.notificationsHint')}</p>
          </div>
          <Toggle checked={settings.notificationsEnabled} onChange={handleNotificationsToggle} />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.backup')}</h2>
        <BackupSection />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-soft">{t('settings.profiles')}</h2>
        <ProfileSection />
      </section>

      <MarkSalaryReceivedSheet
        open={markReceivedOpen}
        onClose={() => setMarkReceivedOpen(false)}
        currency={settings.currency}
        defaultAmount={activePeriod?.salaryAmount ?? settings.defaultSalaryAmount}
      />
    </div>
  )
}
