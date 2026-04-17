'use client'
import { useState, useRef } from 'react'
import { useStore } from '@whisper/supabase'
import Modal from '@/components/ui/Modal'
import { t, tCat } from '@/lib/i18n'

const CATEGORIES = ['ljubav', 'blamovi', 'misli', 'random', 'posao', 'veze']
const CAT_EMOJIS: Record<string, string> = { ljubav: '❤️', blamovi: '😳', misli: '💭', random: '🎲', posao: '💼', veze: '💔' }
const MAX = 500

interface Props { open: boolean; onClose: () => void }

export default function ComposeModal({ open, onClose }: Props) {
  const { addPost, user, showToast } = useStore()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('ljubav')
  const [imageData, setImageData] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const lang = user?.language

  function handleSubmit() {
    if (!user) { showToast(t(lang, 'composeLoginRequired')); return }
    if (text.trim().length < 10) { showToast(t(lang, 'composeTooShort')); return }
    addPost(text.trim(), category, imageData)
    setText('')
    setImageData(null)
    onClose()
  }

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageData(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <Modal open={open} onClose={onClose} title={t(lang, 'composeTitle')}>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 'var(--space-lg)', marginTop: '-8px' }}>{t(lang, 'composeSubtitle')}</p>

      <div className="category-select">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-select-btn${category === cat ? ' selected' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {CAT_EMOJIS[cat]} {tCat(lang, cat)}
          </button>
        ))}
      </div>

      <textarea
        className="compose-textarea"
        placeholder={t(lang, 'composePlaceholder')}
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={MAX}
        autoFocus={open}
      />
      <div className={`char-count${text.length > MAX * 0.8 ? ' warning' : ''}`}>
        {text.length} / {MAX}
      </div>

      <div className="image-upload-row">
        <button className="btn-img-upload" onClick={() => fileRef.current?.click()}>
          <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          {t(lang, 'addImage')}
        </button>
        {imageData && (
          <div className="compose-img-preview">
            <img src={imageData} alt="" />
            <div className="compose-img-remove" onClick={() => setImageData(null)}>✕</div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageSelected} />

      <button className="btn-submit" onClick={handleSubmit}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        {t(lang, 'composeBtn')}
      </button>
    </Modal>
  )
}
