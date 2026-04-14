'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { useStore } from '@whisper/supabase'
import { TOPICS } from '@whisper/shared'
import type { Post } from '@whisper/shared'
import Avatar from '@/components/ui/Avatar'
import { useRouter } from 'next/navigation'

const TAG_COLORS = [
  '255, 69, 58', '255, 159, 10', '191, 90, 242',
  '50, 215, 75', '10, 132, 255', '255, 55, 95',
  '255, 149, 0', '48, 176, 199',
]

interface Props { open: boolean; onClose: () => void }

export default function SearchOverlay({ open, onClose }: Props) {
  const { posts, getPostAuthor } = useStore()
  const router = useRouter()
  const [tags, setTags] = useState<string[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(word: string) {
    const w = word.trim().toLowerCase()
    if (!w || tags.includes(w)) return
    setTags(t => [...t, w])
    setInput('')
  }

  function removeTag(tag: string) {
    setTags(t => t.filter(x => x !== tag))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
    else if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags[tags.length - 1])
    else if (e.key === 'Escape') onClose()
  }

  const regularPosts = posts.filter(p => !p.isAdmin)
  const results: Post[] = tags.length === 0 ? [] : regularPosts.filter(p =>
    tags.some(tag => p.text.toLowerCase().includes(tag) || p.category.toLowerCase().includes(tag))
  )

  function highlight(text: string): string {
    if (!tags.length) return text
    const regex = new RegExp(`(${tags.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  function handleClose() {
    setTags([])
    setInput('')
    onClose()
  }

  return (
    <div className={`search-overlay${open ? ' active' : ''}`}>
      <div className="search-header">
        <span className="search-title">Istraži priče</span>
        <button className="search-close-btn" onClick={handleClose}>
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <div className="search-input-wrap">
        <div className="search-field" onClick={() => inputRef.current?.focus()}>
          <svg className="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <div className="search-tags-row">
            <div className="search-tags">
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className="search-tag"
                  style={{ '--tag-rgb': TAG_COLORS[i % TAG_COLORS.length] } as React.CSSProperties}
                >
                  {tag}
                  <button className="search-tag-remove" onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              className="search-input"
              placeholder={tags.length === 0 ? 'Pretraži po ključnoj reči...' : 'Dodaj još...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus={open}
            />
          </div>
        </div>
      </div>

      <div className="search-quick-cats">
        <span className="search-quick-label">Brzo:</span>
        {TOPICS.filter(t => t.id !== 'sve').map(t => (
          <button key={t.id} className="search-quick-btn" onClick={() => addTag(t.label.toLowerCase())}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="search-results-header">
          <span className="search-count">{results.length} {results.length === 1 ? 'rezultat' : 'rezultata'}</span>
        </div>
      )}

      <div className="search-results">
        {tags.length === 0 ? (
          <div className="search-empty-state">
            <span className="search-empty-emoji">🔍</span>
            <p>Upiši reč i pritisni Enter da dodaš tag</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <span className="search-empty-emoji">😶</span>
            <p>Nema priča za ove tagove</p>
          </div>
        ) : (
          results.map(post => {
            const author = getPostAuthor(post)
            return (
              <div
                key={post.id}
                className="search-result-card"
                onClick={() => { handleClose(); router.push(`/thread/${post.id}`) }}
              >
                <div className="search-result-meta">
                  <Avatar initials={author.initials} color={author.color} size="sm" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{author.name}</span>
                  <span className="search-result-time">{post.time}</span>
                </div>
                <p className="search-result-text" dangerouslySetInnerHTML={{ __html: highlight(post.text) }} />
                <div className="search-result-footer">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {post.commentCount} komentara · {post.category}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
