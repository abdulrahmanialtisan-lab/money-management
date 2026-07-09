import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { db, DEFAULT_SETTINGS } from '../../db/db'
import { upsertCommitment } from '../../db/commitments'
import { rollPeriodsIfNeeded } from '../../db/periodService'
import { applyLanguage } from '../../i18n'
import { Pill } from '../../components/ui/Pill'
import { TextField } from '../../components/ui/TextField'
import { Select } from '../../components/ui/Select'
import { AmountInput } from '../../components/ui/AmountInput'
import { SUPPORTED_CURRENCIES } from '../../utils/currency'
import { makeId } from '../../utils/id'

const WEEKDAY_LABELS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_LABELS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface DraftCommitment {
  key: string
  name: string
  amount: string
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { t, i18n } = useTranslation()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [language, setLanguage] = useState<'en' | 'ar'>((i18n.language as 'en' | 'ar') || 'ar')
  const [currency, setCurrency] = useState('SAR')
  const [salaryAmount, setSalaryAmount] = useState('')
  const [payday, setPayday] = useState('25')
  const [weekStartDay, setWeekStartDay] = useState('6')
  const [commitmentDrafts, setCommitmentDrafts] = useState<DraftCommitment[]>([])
  const [submitting, setSubmitting] = useState(false)

  const weekdayLabels = language === 'ar' ? WEEKDAY_LABELS_AR : WEEKDAY_LABELS_EN

  function changeLanguage(lang: 'en' | 'ar') {
    setLanguage(lang)
    applyLanguage(lang)
  }

  function addCommitmentDraft() {
    setCommitmentDrafts((prev) => [...prev, { key: makeId(), name: '', amount: '' }])
  }

  function updateDraft(key: string, patch: Partial<DraftCommitment>) {
    setCommitmentDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  function removeDraft(key: string) {
    setCommitmentDrafts((prev) => prev.filter((d) => d.key !== key))
  }

  async function finish() {
    setSubmitting(true)
    const now = new Date().toISOString()
    const settings = {
      ...DEFAULT_SETTINGS,
      language,
      currency,
      defaultSalaryAmount: Number(salaryAmount) || 0,
      payday: Number(payday),
      weekStartDay: Number(weekStartDay) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      onboardingCompleted: true,
      schemaVersion: DEFAULT_SETTINGS.schemaVersion,
    }
    await db.settings.put(settings)

    for (const draft of commitmentDrafts) {
      if (!draft.name.trim() || !Number(draft.amount)) continue
      await upsertCommitment({ name: draft.name.trim(), amount: Number(draft.amount), active: true })
    }

    await rollPeriodsIfNeeded(settings)
    void now
    setSubmitting(false)
    onComplete()
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-surface-2'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-ink">{t('onboarding.welcomeTitle')}</h1>
          <p className="mt-2 text-sm text-muted">{t('onboarding.welcomeSubtitle')}</p>

          <div className="mt-8 space-y-5">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t('onboarding.language')}</span>
              <div className="flex gap-2">
                <Pill variant={language === 'ar' ? 'dark' : 'outline'} onClick={() => changeLanguage('ar')} className="flex-1">
                  العربية
                </Pill>
                <Pill variant={language === 'en' ? 'dark' : 'outline'} onClick={() => changeLanguage('en')} className="flex-1">
                  English
                </Pill>
              </div>
            </div>

            <Select
              label={t('onboarding.currency')}
              value={currency}
              onChange={setCurrency}
              options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="mt-auto pt-8">
            <Pill variant="dark" className="w-full" onClick={() => setStep(2)}>
              {t('onboarding.continue')}
            </Pill>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-ink">{t('onboarding.salaryAmount')}</h1>
          <p className="mt-2 text-sm text-muted">{t('onboarding.salaryHelp')}</p>

          <div className="mt-8 space-y-5">
            <AmountInput value={salaryAmount} onChange={setSalaryAmount} currency={currency} />

            <Select
              label={t('onboarding.payday')}
              value={payday}
              onChange={setPayday}
              options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            />
            <p className="-mt-3 text-xs text-muted">{t('onboarding.paydayHelp')}</p>

            <Select
              label={t('onboarding.weekStart')}
              value={weekStartDay}
              onChange={setWeekStartDay}
              options={weekdayLabels.map((label, i) => ({ value: String(i), label }))}
            />
            <p className="-mt-3 text-xs text-muted">{t('onboarding.weekStartHelp')}</p>
          </div>

          <div className="mt-auto flex gap-2 pt-8">
            <Pill variant="outline" onClick={() => setStep(1)}>
              {t('common.back')}
            </Pill>
            <Pill variant="dark" className="flex-1" onClick={() => setStep(3)} disabled={!salaryAmount}>
              {t('onboarding.continue')}
            </Pill>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-ink">{t('onboarding.addCommitmentsTitle')}</h1>
          <p className="mt-2 text-sm text-muted">{t('onboarding.addCommitmentsSubtitle')}</p>

          <div className="mt-6 space-y-3">
            {commitmentDrafts.map((draft) => (
              <div key={draft.key} className="flex items-center gap-2">
                <TextField
                  placeholder={t('commitments.namePlaceholder')}
                  value={draft.name}
                  onChange={(e) => updateDraft(draft.key, { name: e.target.value })}
                  className="flex-[2]"
                />
                <TextField
                  inputMode="decimal"
                  placeholder="0.00"
                  value={draft.amount}
                  onChange={(e) => updateDraft(draft.key, { amount: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeDraft(draft.key)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-danger-strong"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCommitmentDraft}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted"
            >
              <Plus size={16} />
              {t('commitments.addCommitment')}
            </button>
          </div>

          <div className="mt-auto flex gap-2 pt-8">
            <Pill variant="outline" onClick={() => setStep(2)}>
              {t('common.back')}
            </Pill>
            <Pill variant="dark" className="flex-1" onClick={finish} disabled={submitting}>
              {t('onboarding.finish')}
            </Pill>
          </div>
        </div>
      )}
    </div>
  )
}
