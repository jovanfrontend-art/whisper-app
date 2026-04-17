'use client'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@whisper/supabase'
import Avatar from '@/components/ui/Avatar'
import AuthModal from '@/components/auth/AuthModal'
import NotificationsPanel from '@/components/layout/NotificationsPanel'
import ComposeModal from '@/components/feed/ComposeModal'
import SearchOverlay from '@/components/search/SearchOverlay'
import ProfileOverlay from '@/components/profile/ProfileOverlay'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'

export default function AppHeader() {
  const { user, logout, notifications, markAllRead } = useStore()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const lang = user?.language
  const unread = notifications.filter(n => !n.read).length
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  return (
    <>
      <header className="app-header">
        <a className="header-logo" href="/">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.7 0-3.29-.43-4.67-1.19l-.33-.19-3.02.8.82-2.95-.21-.34A8 8 0 0 1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z"/>
            </svg>
          </div>
          <span className="logo-name">Whis<span>perX</span></span>
        </a>

        {!user ? (
          <div className="header-auth">
            <button className="btn-ghost" onClick={() => setAuthOpen(true)}>{t(lang, 'loginBtn')}</button>
            <button className="btn-primary-sm" onClick={() => setAuthOpen(true)}>{t(lang, 'headerRegisterBtn')}</button>
          </div>
        ) : (
          <div className="header-user">
            <nav className="header-desktop-nav">
              <button className="header-nav-btn" onClick={() => setComposeOpen(true)}>
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                {t(lang, 'navShare')}
              </button>
              <button className="header-nav-btn" onClick={() => setSearchOpen(true)}>
                <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                {t(lang, 'navExplore')}
              </button>
            </nav>

            <div ref={notifRef}>
              <button className="notif-btn" onClick={() => setNotifOpen(v => !v)}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>

              <div className={`notif-dropdown${notifOpen ? ' open' : ''}`}>
                <div className="notif-dropdown-header">
                  <h4>{t(lang, 'notifTitle')}</h4>
                  {unread > 0 && <button className="notif-mark-all" onClick={markAllRead}>{t(lang, 'notifMarkAll')}</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">{t(lang, 'notifNewEmpty')}</div>
                ) : notifications.slice(0, 4).map(n => (
                  <div
                    key={n.id}
                    className={`notif-item${!n.read ? ' unread' : ''}`}
                    onClick={() => {
                      const url = n.type === 'comment' && n.commentId
                        ? `/thread/${n.postId}#comment-${n.commentId}`
                        : `/thread/${n.postId}`
                      router.push(url)
                      setNotifOpen(false)
                    }}
                  >
                    <div className={`notif-dot${n.read ? ' notif-dot-read' : ''}`} />
                    <div className="notif-content">
                      <div className="notif-text">
                        <strong>{n.commenterUsername}</strong>
                        {n.type === 'comment' ? t(lang, 'notifComment') : t(lang, 'notifReaction')}
                      </div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
                {notifications.length > 0 && (
                  <button className="notif-see-more" onClick={(e) => { e.stopPropagation(); setNotifOpen(false); setNotifPanelOpen(true) }}>
                    {t(lang, 'notifSeeAll')} ({notifications.length})
                  </button>
                )}
              </div>
            </div>

            {user.isAdmin && (
              <a className="btn-ghost" style={{ fontSize: 12 }} href="/admin" target="_blank" rel="noopener noreferrer">
                ⚙️ Admin
              </a>
            )}

            <button className="user-avatar-btn desktop-only" onClick={() => setProfileOpen(true)}>
              <Avatar
                initials={(user.username || 'U')[0].toUpperCase()}
                color={user.color}
                avatarImage={user.avatarUrl}
                size="sm"
              />
              <span className="user-name-sm">{user.username || t(lang, 'youLabel')}</span>
            </button>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <NotificationsPanel open={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProfileOverlay
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLoginClick={() => { setProfileOpen(false); setAuthOpen(true) }}
      />
    </>
  )
}
