import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pill } from '../../components/ui/Pill'
import { TextField } from '../../components/ui/TextField'
import { createProfile, getActiveProfile, listProfiles, switchToProfile } from '../../db/profiles'
import { useUiStore } from '../../state/uiStore'
import { cn } from '../../utils/cn'

export function ProfileSection() {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const [profiles, setProfiles] = useState(listProfiles())
  const active = getActiveProfile()
  const [newName, setNewName] = useState('')

  function handleCreate() {
    if (!newName.trim()) return
    try {
      createProfile(newName.trim())
      setProfiles(listProfiles())
      setNewName('')
      showToast(t('toast.profileCreated'))
    } catch {
      // name already exists or invalid — no-op, input stays for correction
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {profiles.map((p) => (
          <div key={p} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
            <span className={cn('text-sm font-medium', p === active && 'text-accent-strong')}>{p}</span>
            {p === active ? (
              <span className="text-xs text-muted">{t('settings.activeProfile')}</span>
            ) : (
              <button type="button" onClick={() => switchToProfile(p)} className="text-xs font-medium text-accent-strong">
                {t('settings.switchProfile')}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <TextField value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('settings.newProfile')} className="flex-1" />
        <Pill variant="outline" onClick={handleCreate} disabled={!newName.trim()}>
          {t('common.add')}
        </Pill>
      </div>
    </div>
  )
}
