import { AVATAR_COLORS } from './constants'
import type { Avatar } from './types'

export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return n.toString()
}

export function getAnonName(initials: string): string {
  return `Anonimni ${initials}`
}

// In-memory fallback for environments without localStorage (React Native)
let _memorySessionId: string | null = null

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  // Web: use localStorage for persistence across page reloads
  if (typeof localStorage !== 'undefined') {
    let sid = localStorage.getItem('whisper_session_id')
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).slice(2)
      localStorage.setItem('whisper_session_id', sid)
    }
    return sid
  }
  // React Native: use in-memory session (good enough for identifying the current session)
  if (!_memorySessionId) {
    _memorySessionId = 'sess_' + Math.random().toString(36).slice(2)
  }
  return _memorySessionId
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffMin < 1) return 'upravo'
  if (diffMin < 60) return `pre ${diffMin}min`
  if (diffHour < 24) return `pre ${diffHour}h`
  if (diffDay < 7) return `pre ${diffDay}d`
  return date.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' })
}

export function randomAvatar(): Avatar {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return {
    initials: letters[Math.floor(Math.random() * letters.length)] + Math.floor(Math.random() * 9),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  }
}
