export type Importance = 'important' | 'not_important'
export type ImportanceOrUnclassified = Importance | 'unclassified'

export interface Settings {
  id: 'singleton'
  currency: string
  language: 'en' | 'ar'
  theme: 'light' | 'dark' | 'system'
  payday: number
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6
  defaultSalaryAmount: number
  importantTargetRatio: number
  notificationsEnabled: boolean
  bankBalance: number
  onboardingCompleted: boolean
  schemaVersion: number
}

export interface Commitment {
  id: string
  name: string
  amount: number
  category?: string
  dueDayOfMonth?: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface SpendingItem {
  id: string
  name: string
  importance: Importance
  icon: string
  color: string
  usageCount: number
  lastUsedAt?: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  date: string
  amount: number
  spendingItemId?: string
  itemNameSnapshot: string
  importanceSnapshot: ImportanceOrUnclassified
  note?: string
  periodId: string
  createdAt: string
  updatedAt: string
}

export interface CommitmentSnapshot {
  commitmentId: string
  name: string
  amount: number
}

export interface PayPeriodWeek {
  index: number
  startDate: string
  endDate: string
  daysInWeek: number
  budget: number
}

export interface ClosedPeriodSummary {
  totalSpent: number
  importantSpent: number
  unimportantSpent: number
  unclassifiedSpent: number
  importantPct: number | null
  weeklyActuals: number[]
}

export interface PayPeriod {
  id: string
  startDate: string
  endDate: string
  salaryAmount: number
  status: 'active' | 'closed'
  totalCommitments: number
  commitmentBreakdown: CommitmentSnapshot[]
  leftoverAfterCommitments: number
  weeks: PayPeriodWeek[]
  closedSummary?: ClosedPeriodSummary
  createdAt: string
  updatedAt: string
}
