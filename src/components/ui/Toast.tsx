import { useEffect } from 'react'
import { useUiStore } from '../../state/uiStore'

export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const clearToast = useUiStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(clearToast, 2400)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-5">
      <div className="rounded-full bg-ink px-5 py-2.5 text-sm text-bg shadow-lg">{toast}</div>
    </div>
  )
}
