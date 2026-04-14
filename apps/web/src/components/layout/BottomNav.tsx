'use client'
import { useStore } from '@whisper/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'

interface Props {
  onCompose: () => void
  onSearch: () => void
  onProfile: () => void
}

export default function BottomNav({ onCompose, onSearch, onProfile }: Props) {
  const { user } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'

  if (!user) {
    return (
      <nav className="bottom-nav">
        <button className="nav-item nav-item--compose" onClick={onSearch}>
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <span>Istraži</span>
        </button>
      </nav>
    )
  }

  return (
    <nav className="bottom-nav">
      <button className="nav-item nav-item--compose" onClick={onCompose}>
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
        <span>Podeli</span>
      </button>

      <button className="nav-item nav-item--compose" onClick={onSearch}>
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>Istraži</span>
      </button>

      <button className="nav-item nav-item--profile" onClick={onProfile}>
        <Avatar
          initials={(user.username || 'U')[0].toUpperCase()}
          color={user.color}
          avatarImage={user.avatarUrl}
          size="sm"
        />
        <span>{user.username || 'Ti'}</span>
      </button>
    </nav>
  )
}
