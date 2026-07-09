import { create } from 'zustand'

interface UiState {
  addExpenseOpen: boolean
  prefillItemId: string | null
  openAddExpense: (prefillItemId?: string) => void
  closeAddExpense: () => void
  toast: string | null
  showToast: (message: string) => void
  clearToast: () => void
}

export const useUiStore = create<UiState>((set) => ({
  addExpenseOpen: false,
  prefillItemId: null,
  openAddExpense: (prefillItemId) => set({ addExpenseOpen: true, prefillItemId: prefillItemId ?? null }),
  closeAddExpense: () => set({ addExpenseOpen: false, prefillItemId: null }),
  toast: null,
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}))
