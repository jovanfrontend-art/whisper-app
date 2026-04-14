'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@whisper/supabase'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: Props) {
  const { login, signup, showToast } = useStore()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) { setError(''); setEmail(''); setPassword(''); setUsername(''); setTab('login') }
  }, [open])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (ok) onClose()
    else setError('Pogrešan email ili lozinka.')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Upiši korisničko ime.'); return }
    const ok = await signup(email, username, password)
    if (ok) onClose()
    else setError('Greška pri registraciji. Pokušaj ponovo.')
  }

  return (
    <>
      <div className={`modal-backdrop${open ? ' active' : ''}`} onClick={onClose} />
      <div className={`auth-modal${open ? ' active' : ''}`}>
        <div className="modal-handle" />
        <div className="modal-title">Pridruži se Whisper-u</div>
        <div className="modal-subtitle">Podeli priču, ostani anoniman/na</div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Prijava</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Registracija</button>
        </div>

        {tab === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="tvoj@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ fontSize: 13, color: '#FF6961' }}>{error}</p>}
            <button className="btn-submit" type="submit">Prijavi se</button>
            <div className="form-divider">ili</div>
            <button className="btn-guest" type="button" onClick={onClose}>Nastavi kao gost</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-field">
              <label className="form-label">Korisničko ime</label>
              <input className="form-input" type="text" placeholder="Kako da te zovemo?" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="tvoj@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="Min 8 karaktera" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ fontSize: 13, color: '#FF6961' }}>{error}</p>}
            <button className="btn-submit" type="submit">Napravi nalog</button>
          </form>
        )}
      </div>
    </>
  )
}
