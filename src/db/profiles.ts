const ACTIVE_PROFILE_KEY = 'payday:activeProfile'
const PROFILES_LIST_KEY = 'payday:profiles'
export const DEFAULT_PROFILE = 'default'

export function dbNameForProfile(profile: string): string {
  return `payday-db-${profile}`
}

export function getActiveProfile(): string {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || DEFAULT_PROFILE
}

export function listProfiles(): string[] {
  const raw = localStorage.getItem(PROFILES_LIST_KEY)
  const list: string[] = raw ? JSON.parse(raw) : []
  if (!list.includes(DEFAULT_PROFILE)) list.unshift(DEFAULT_PROFILE)
  return list
}

function saveProfilesList(list: string[]) {
  localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(list))
}

export function createProfile(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Profile name cannot be empty')
  const list = listProfiles()
  if (list.includes(trimmed)) throw new Error('Profile already exists')
  saveProfilesList([...list, trimmed])
}

export function switchToProfile(name: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, name)
  window.location.reload()
}
