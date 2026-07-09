import { CalendarDays, Home, Plus, Settings2, Tags, PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '../../state/uiStore'
import { cn } from '../../utils/cn'

const TABS = [
  { to: '/', key: 'home', Icon: Home },
  { to: '/calendar', key: 'calendar', Icon: CalendarDays },
  { to: '/items', key: 'items', Icon: Tags },
  { to: '/reports', key: 'reports', Icon: PieChart },
  { to: '/settings', key: 'settings', Icon: Settings2 },
] as const

export function BottomNav() {
  const { t } = useTranslation()
  const openAddExpense = useUiStore((s) => s.openAddExpense)

  const leftTabs = TABS.slice(0, 2)
  const rightTabs = TABS.slice(2)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md items-center justify-between gap-1 border-t border-border bg-surface px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      {leftTabs.map((tab) => (
        <NavTab key={tab.key} to={tab.to} label={t(`nav.${tab.key}`)} Icon={tab.Icon} end={tab.to === '/'} />
      ))}

      <button
        type="button"
        onClick={() => openAddExpense()}
        aria-label={t('expense.addExpense')}
        className="mx-1 flex h-14 w-14 shrink-0 -translate-y-4 items-center justify-center rounded-full bg-ink text-bg shadow-lg active:opacity-80"
      >
        <Plus size={26} />
      </button>

      {rightTabs.map((tab) => (
        <NavTab key={tab.key} to={tab.to} label={t(`nav.${tab.key}`)} Icon={tab.Icon} />
      ))}
    </nav>
  )
}

function NavTab({
  to,
  label,
  Icon,
  end,
}: {
  to: string
  label: string
  Icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] transition-colors',
          isActive ? 'text-ink' : 'text-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
          <span className={cn(isActive && 'font-medium')}>{label}</span>
        </>
      )}
    </NavLink>
  )
}
