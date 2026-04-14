'use client'
import { useState, useRef } from 'react'
import { useStore } from '@whisper/supabase'

const CATEGORIES = ['Ljubav', 'Blamovi', 'Misli', 'Random', 'Posao', 'Veze']
const CAT_EMOJIS: Record<string, string> = { Ljubav: '❤️', Blamovi: '😳', Misli: '💭', Random: '🎲', Posao: '💼', Veze: '💔' }
const MAX = 500

interface Props { open: boolean; onClose: () => void }

export default function ComposeModal({ open, onClose }: Props) {
  const { addPost, user, showToast } = useStore()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Ljubav')
  const [imageData, setImageData] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    if (!user) { showToast('Uloguj se da bi podelio/la priču 🔐'); return }
    if (text.trim().length < 10) { showToast('Napiši barem 10 karaktera. ✍️'); return }
    addPost(text.trim(), category.toLowerCase(), imageData)
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
    <>
      <div className={`modal-backdrop${open ? ' active' : ''}`} onClick={onClose} />
      <div className={`modal-sheet${open ? ' active' : ''}`}>
        <div className="modal-handle" />
        <div className="modal-title">Podeli svoju priču</div>
        <div className="modal-subtitle">Anonimno · bez osude · samo istina</div>

        <div className="category-select">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-select-btn${category === cat ? ' selected' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {CAT_EMOJIS[cat]} {cat}
            </button>
          ))}
        </div>

        <textarea
          className="compose-textarea"
          placeholder="Šta nosiš u sebi? Ovo je tvoje mesto..."
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
            Dodaj sliku
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
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#0E0E0F"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          Podeli priču
        </button>
      </div>
    </>
  )
}
