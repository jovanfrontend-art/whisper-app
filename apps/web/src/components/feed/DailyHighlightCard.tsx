'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@whisper/supabase'
import type { Category, DailyHighlight } from '@whisper/shared'
import { CATEGORY_RGB, formatCount } from '@whisper/shared'
import ReactionBar from '@/components/ui/ReactionBar'
import { useRouter } from 'next/navigation'

export default function DailyHighlightCard() {
  const { activeCategory, getDailyHighlight, toggleReaction } = useStore()
  const router = useRouter()
  const [highlight, setHighlight] = useState<DailyHighlight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDailyHighlight(activeCategory).then(h => {
      setHighlight(h)
      setLoading(false)
    })
  }, [activeCategory, getDailyHighlight])

  const rgb = CATEGORY_RGB[activeCategory] || CATEGORY_RGB.sve

  if (loading || !highlight) {
    return (
      <div className="daily-highlight" style={{ '--daily-rgb': rgb } as React.CSSProperties}>
        <div className="daily-tag">✨ Tema dana</div>
        <div className="daily-title skeleton" style={{ height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.08)', width: '70%' }} />
        <p className="daily-text skeleton" style={{ height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginTop: 8 }} />
      </div>
    )
  }

  return (
    <div className="daily-highlight" style={{ '--daily-rgb': rgb } as React.CSSProperties}>
      <div className="daily-tag">✨ Tema dana</div>
      <div className="daily-title">{highlight.title}</div>
      <p className="daily-text">{highlight.subtitle}</p>

      <div className="reactions-bar" onClick={e => e.stopPropagation()}>
        <ReactionBar
          reactions={highlight.reactions}
          userReactions={highlight.userReactions}
          onToggle={(emoji) => {
            toggleReaction(highlight.postId, emoji)
            // Re-fetch highlight to update counts
            getDailyHighlight(activeCategory).then(h => h && setHighlight(h))
          }}
        />
      </div>

      <div className="post-card-footer">
        <div className="post-comments-info">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {formatCount(highlight.commentCount)} komentara
        </div>
        <button className="btn-enter-thread" onClick={() => router.push(`/thread/${highlight.postId}`)}>
          Uđi u priču
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}
