import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/nav/BottomNav'
import { AddExpenseSheet } from './features/expense/AddExpenseSheet'
import { HomeScreen } from './features/home/HomeScreen'
import { CalendarScreen } from './features/calendar/CalendarScreen'
import { ItemsScreen } from './features/items/ItemsScreen'
import { ReportsScreen } from './features/reports/ReportsScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { CommitmentsScreen } from './features/commitments/CommitmentsScreen'
import { OnboardingFlow } from './features/onboarding/OnboardingFlow'
import { Toast } from './components/ui/Toast'
import { applyLanguage } from './i18n'
import { rollPeriodsIfNeeded } from './db/periodService'
import { useSettingsState } from './state/settingsQueries'
import { db } from './db/db'
import { checkUpcomingCommitments } from './lib/notifications'

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

export default function App() {
  const settingsState = useSettingsState()
  const loading = settingsState === 'loading'
  const settings = settingsState !== 'loading' && settingsState !== 'not-found' ? settingsState : null
  const onboarded = !!settings?.onboardingCompleted

  useEffect(() => {
    if (!settings) return
    applyLanguage(settings.language)
    applyTheme(settings.theme)
  }, [settings])

  useEffect(() => {
    if (!settings || !onboarded) return
    rollPeriodsIfNeeded(settings)
    const onVisible = () => {
      if (document.visibilityState === 'visible') rollPeriodsIfNeeded(settings)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [settings, onboarded])

  useEffect(() => {
    if (!settings || !onboarded || !settings.notificationsEnabled) return
    db.commitments.toArray().then(checkUpcomingCommitments)
  }, [settings, onboarded])

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-bg text-muted">…</div>
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => {}} />
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-bg pb-28">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/items" element={<ItemsScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/commitments" element={<CommitmentsScreen />} />
      </Routes>
      <BottomNav />
      <AddExpenseSheet />
      <Toast />
    </div>
  )
}
