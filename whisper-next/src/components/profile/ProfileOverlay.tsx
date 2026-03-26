'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import Avatar from '@/components/ui/Avatar'

interface Props { open: boolean; onClose: () => void; onLoginClick: () => void }

export default function ProfileOverlay({ open, onClose, onLoginClick }: Props) {
  const { user, logout, updateProfile, showToast } = useStore()
  const [username, setUsername] = useState('')
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [previewHint, setPreviewHint] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setAvatarImage(user.avatarUrl || null)
    }
    setConfirmLogout(false)
  }, [user, open])

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarImage(ev.target?.result as string)
      setPreviewHint(true)
      setTimeout(() => setPreviewHint(false), 2000)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSave() {
    if (!username.trim()) { showToast('Korisničko ime ne može biti prazno.'); return }
    updateProfile(username.trim(), avatarImage)
    showToast('Profil sačuvan! ✅')
    onClose()
  }

  function handleLogout() {
    logout()
    setConfirmLogout(false)
    onClose()
    showToast('Odjavljen/a si. Vidimo se! 👋')
  }

  return (
    <div className={`profile-overlay${open ? ' active' : ''}`}>
      <div className="profile-header">
        <span className="profile-title">Moj profil</span>
        <button className="profile-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <div className="profile-body">
        {!user ? (
          <div className="profile-guest">
            <span className="profile-guest-icon">👤</span>
            <h3>Nisi prijavljen/a</h3>
            <p>Prijavi se da bi imao/la profil, pratio/la svoje priče i dobijao/la obaveštenja.</p>
            <button className="profile-login-btn" onClick={() => { onClose(); onLoginClick() }}>Prijavi se</button>
            <button className="profile-login-btn profile-login-btn--ghost" onClick={onClose}>Nastavi kao gost</button>
          </div>
        ) : confirmLogout ? (
          <div className="profile-confirm-logout">
            <span className="profile-confirm-icon">👋</span>
            <h3>Sigurno se odjavljuješ?</h3>
            <p>Možeš se uvek ponovo prijaviti.</p>
            <button className="profile-logout-btn" style={{ color: '#FF453A', borderColor: 'rgba(255,69,58,0.4)' }} onClick={handleLogout}>Da, odjavi me</button>
            <button className="profile-login-btn profile-login-btn--ghost" onClick={() => setConfirmLogout(false)}>Odustani</button>
          </div>
        ) : (
          <>
            <div className="profile-avatar-wrap">
              {avatarImage ? (
                <div className="profile-avatar-img" style={{ backgroundImage: `url(${avatarImage})` }} />
              ) : (
                <div className="profile-avatar-initials" style={{ background: user.color }}>
                  {(user.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <button className="profile-avatar-edit" onClick={() => fileRef.current?.click()}>
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <span className={`profile-avatar-preview-hint${previewHint ? ' visible' : ''}`}>Slika odabrana ✓</span>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageSelected} />
            </div>

            <div className="profile-form">
              <div className="profile-field">
                <label className="profile-label">Korisničko ime</label>
                <input className="profile-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tvoje ime..." />
              </div>
              <div className="profile-field">
                <label className="profile-label">Email</label>
                <div className="profile-static">{user.email}</div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-save-btn" onClick={handleSave}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                Sačuvaj profil
              </button>
              <button className="profile-logout-btn" onClick={() => setConfirmLogout(true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                Odjavi se
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
