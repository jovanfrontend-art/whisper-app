'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@whisper/supabase'
import Modal from '@/components/ui/Modal'
import LanguagePicker from '@/components/ui/LanguagePicker'
import { t, SUPPORTED_LANGUAGES } from '@/lib/i18n'

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
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [language, setLanguage] = useState(() => {
    if (typeof navigator === 'undefined') return 'sr'
    const code = navigator.language.slice(0, 2)
    return SUPPORTED_LANGUAGES.some(l => l.code === code) ? code : 'sr'
  })

  useEffect(() => {
    if (!open) { setError(''); setEmail(''); setPassword(''); setUsername(''); setTab('login'); setConfirmEmail(false) }
  }, [open])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (ok) onClose()
    else setError(t(language, 'wrongCredentials'))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError(t(language, 'emptyUsername')); return }
    const result = await signup(email, username, password, language)
    if (result.status === 'ok') onClose()
    else if (result.status === 'confirm_email') setConfirmEmail(true)
    else setError(result.message ?? t(language, 'signupError'))
  }

  const lang = language

  return (
    <Modal open={open} onClose={onClose} title={t(lang, 'authTitle')}>
      {confirmEmail ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{t(lang, 'checkEmail')}</p>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
            {t(lang, 'emailSent')} <strong>{email}</strong>.<br />
            {t(lang, 'emailActivate')}
          </p>
          <button className="btn-guest" style={{ marginTop: 20 }} onClick={onClose}>{t(lang, 'closeBtn')}</button>
        </div>
      ) : tab === 'login' ? (
        <>
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>{t(lang, 'loginTab')}</button>
            <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>{t(lang, 'signupTab')}</button>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label className="form-label">{t(lang, 'emailLabel')}</label>
              <input className="form-input" type="email" placeholder={t(lang, 'emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">{t(lang, 'passwordLabel')}</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ fontSize: 13, color: '#FF6961' }}>{error}</p>}
            <button className="btn-submit" type="submit">{t(lang, 'loginBtn')}</button>
            <div className="form-divider">{t(lang, 'orDivider')}</div>
            <button className="btn-guest" type="button" onClick={onClose}>{t(lang, 'guestBtn')}</button>
          </form>
        </>
      ) : (
        <>
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>{t(lang, 'loginTab')}</button>
            <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>{t(lang, 'signupTab')}</button>
          </div>
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-field">
              <label className="form-label">{t(lang, 'usernameLabel')}</label>
              <input className="form-input" type="text" placeholder={t(lang, 'usernamePlaceholder')} value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">{t(lang, 'emailLabel')}</label>
              <input className="form-input" type="email" placeholder={t(lang, 'emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">{t(lang, 'passwordLabel')}</label>
              <input className="form-input" type="password" placeholder={t(lang, 'passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <LanguagePicker value={language} onChange={setLanguage} label={t(lang, 'languageLabel')} />
            {error && <p style={{ fontSize: 13, color: '#FF6961' }}>{error}</p>}
            <button className="btn-submit" type="submit">{t(lang, 'signupBtn')}</button>
          </form>
        </>
      )}
    </Modal>
  )
}
