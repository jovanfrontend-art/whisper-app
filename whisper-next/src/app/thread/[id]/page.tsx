'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore, formatCount } from '@/lib/store'
import { useRouter, useParams } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import ReactionBar from '@/components/ui/ReactionBar'
import AuthModal from '@/components/auth/AuthModal'

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { posts, getPostById, getPostAuthor, user, toggleReaction, toggleCommentReaction, addComment, removeComment, showToast } = useStore()

  const post = getPostById(id)
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState<string | null>(null)
  const [kickTarget, setKickTarget] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  // Scroll to comment from notification link
  useEffect(() => {
    if (!post) return
    const hash = window.location.hash
    if (!hash) return
    const tryScroll = () => {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('highlighted')
        setTimeout(() => el.classList.remove('highlighted'), 2000)
      }
    }
    // Wait for comments to render
    const t = setTimeout(tryScroll, 300)
    return () => clearTimeout(t)
  }, [post])

  if (!post) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        <p>Post nije pronađen.</p>
        <button className="btn-back" onClick={() => router.push('/')}>← Nazad</button>
      </div>
    )
  }

  const author = getPostAuthor(post)
  const isOwner = !!(user && post.userId && user.id === post.userId)
  const isAdminPost = post.isAdmin

  const catClass = post.category ? `cat-${post.category.toLowerCase()}` : ''

  function handleSendComment() {
    const text = commentText.trim()
    if (!text || !post) return
    addComment(post.id, text, commentImage)
    setCommentText('')
    setCommentImage(null)
    setTimeout(() => {
      document.querySelector('.comments-list')?.firstElementChild?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  function onCommentImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCommentImage(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function executeKick(commentId: string) {
    if (!post) return
    removeComment(post.id, commentId)
    setKickTarget(null)
    showToast('Komentar je uklonjen iz tvoje priče. 🚫')
  }

  return (
    <div className="thread-content">
      {/* Fixed header */}
      <div className="thread-header">
        <button className="btn-back" onClick={() => router.back()}>
          <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div className="thread-header-info">
          <div className="thread-header-title">{isAdminPost ? 'Tema dana' : 'Priča'}</div>
          <div className="thread-header-sub">{post.commentCount} komentara</div>
        </div>
        <span className={`cat-pill${isAdminPost ? ' cat-temadana' : ` ${catClass}`}`}>
          {isAdminPost ? '✨ Whisper' : post.category}
        </span>
      </div>

      {/* Original post */}
      <div className="original-post">
        <div className="original-post-body">
          {isOwner && (
            <div className="owner-banner">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              Ovo je tvoja priča · možeš uklanjati neprikladne komentare
            </div>
          )}

          <div className="original-post-header">
            <div className="original-post-meta">
              {isAdminPost ? (
                <div className="avatar lg whisper-avatar">W</div>
              ) : (
                <Avatar initials={author.initials} color={author.color} avatarImage={author.avatarUrl} size="lg" />
              )}
              <div className="original-post-info">
                <span className={`original-post-anon${isAdminPost ? ' whisper-name' : ''}`}>
                  {isAdminPost ? 'Whisper' : author.name}
                </span>
                <span className="original-post-time">{isAdminPost ? 'Admin · Tema dana' : post.time}</span>
              </div>
            </div>
            <span className={`cat-pill${isAdminPost ? ' cat-temadana' : ` ${catClass}`}`}>
              {isAdminPost ? '✨ Tema dana' : post.category}
            </span>
          </div>

          {post.title && <h2 className="original-post-title">{post.title}</h2>}
          <p className="original-post-text">{post.text}</p>
        </div>

        {post.image && (
          <img className="original-post-image" src={post.image} alt="" loading="lazy" />
        )}

        <div className="original-post-footer">
          <ReactionBar
            reactions={post.reactions}
            userReactions={post.userReactions}
            onToggle={(emoji) => toggleReaction(post.id, emoji)}
          />
        </div>
      </div>

      {/* Comments */}
      <div className="comments-section">
        <div className="comments-header">
          <span className="comments-title">Komentari</span>
          <span className="comments-count-badge">{post.comments.length}</span>
        </div>

        <div className="comments-list">
          {post.comments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">💬</span>
              <h3>Nema komentara još</h3>
              <p>Budi prvi koji će dati podršku ili savet!</p>
            </div>
          ) : (
            post.comments.map((c, i) => (
              <div
                key={c.id}
                id={`comment-${c.id}`}
                className={`comment-card${c.isNew ? ' new' : ''}${kickTarget === c.id ? ' kick-target' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="comment-header">
                  <div className="comment-meta">
                    {c.isAdmin
                      ? <div className="avatar sm whisper-avatar">W</div>
                      : <Avatar initials={c.avatar.initials} color={c.avatar.color} size="sm" />
                    }
                    <div className="comment-info">
                      <span className={`comment-anon${c.isAdmin ? ' whisper-name' : ''}`}>
                        {c.username}
                      </span>
                      <span className="comment-time">{c.time}</span>
                    </div>
                  </div>
                  <div className="comment-actions">
                    {isOwner && (
                      <button className="btn-kick" onClick={() => setKickTarget(c.id)}>
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                        Izbaci
                      </button>
                    )}
                  </div>
                </div>

                <p className="comment-text">{c.text}</p>

                {c.image && <img className="comment-image" src={c.image} alt="" loading="lazy" />}

                <div onClick={e => e.stopPropagation()}>
                  <ReactionBar
                    reactions={c.reactions}
                    userReactions={c.userReactions}
                    onToggle={(emoji) => toggleCommentReaction(post.id, c.id, emoji)}
                    size="sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment input */}
      {user ? (
        <div className="comment-input-bar">
          <div className="comment-input-hint">
            <svg viewBox="0 0 24 24"><path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.962 0 9 4.038 9 9s-4.038 9-9 9-9-4.038-9-9 4.038-9 9-9zm-.5 4v5.5l4.5 2.7-.75 1.3-5.25-3V7h1.5z"/></svg>
            Odgovor je anoniman
          </div>

          {commentImage && (
            <div className="comment-img-preview">
              <div className="comment-img-thumb">
                <img src={commentImage} alt="" />
                <button className="comment-img-remove" onClick={() => setCommentImage(null)}>✕</button>
              </div>
            </div>
          )}

          <div className="comment-input-row">
            <button
              className={`btn-img-upload-sm${commentImage ? ' has-image' : ''}`}
              onClick={() => imgInputRef.current?.click()}
            >
              <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              {commentImage && <span className="comment-img-dot" />}
            </button>

            <textarea
              ref={textareaRef}
              className="comment-textarea"
              placeholder="Napiši komentar..."
              value={commentText}
              onChange={e => { setCommentText(e.target.value); autoResize() }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
              rows={1}
            />

            <button
              className="comment-send-btn"
              onClick={handleSendComment}
              disabled={!commentText.trim()}
            >
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>

          <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onCommentImageSelected} />
        </div>
      ) : (
        <div className="comment-input-bar">
          <div className="comment-login-prompt">
            <span>Prijavi se da bi komentarisao/la</span>
            <button className="btn-primary-sm" onClick={() => setAuthOpen(true)}>Prijavi se</button>
          </div>
        </div>
      )}

      {/* Kick dialog */}
      {kickTarget !== null && (
        <>
          <div className="kick-backdrop active" onClick={() => setKickTarget(null)} />
          <div className="kick-dialog active">
            <div className="kick-dialog-handle" />
            <div className="kick-dialog-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
            </div>
            <div className="kick-dialog-title">Ukloni komentar?</div>
            <p className="kick-dialog-text">Ovaj komentar će biti trajno uklonjen iz tvoje priče.</p>
            <div className="kick-dialog-actions">
              <button className="btn-kick-confirm" onClick={() => executeKick(kickTarget)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                Da, ukloni
              </button>
              <button className="btn-kick-cancel" onClick={() => setKickTarget(null)}>Odustani</button>
            </div>
          </div>
        </>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
