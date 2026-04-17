'use client'
import { useRef } from 'react'
import { useStore } from '@whisper/supabase'
import { TOPICS } from '@whisper/shared'
import type { Category } from '@whisper/shared'
import { t, tCat } from '@/lib/i18n'

export default function TopicTabs() {
  const { activeCategory, setActiveCategory, user } = useStore()
  const lang = user?.language
  const touchStartX = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return

    const currentIndex = TOPICS.findIndex(tp => tp.id === activeCategory)
    if (diff > 0 && currentIndex < TOPICS.length - 1) {
      setActiveCategory(TOPICS[currentIndex + 1].id as Category)
    } else if (diff < 0 && currentIndex > 0) {
      setActiveCategory(TOPICS[currentIndex - 1].id as Category)
    }
    touchStartX.current = null
  }

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    dragStartX.current = e.clientX
    scrollStartX.current = scrollRef.current?.scrollLeft ?? 0
    e.preventDefault()
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return
    const diff = e.clientX - dragStartX.current
    scrollRef.current.scrollLeft = scrollStartX.current - diff
  }

  function handleMouseUp() {
    isDragging.current = false
  }

  return (
    <section className="topics-section">
      <div className="topics-label">{t(lang, 'navTopics')}</div>
      <div
        ref={scrollRef}
        className="topics-scroll"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        {TOPICS.map(tp => (
          <button
            key={tp.id}
            className={`topic-chip${activeCategory === tp.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(tp.id as Category)}
          >
            <span className="topic-chip-emoji">{tp.emoji}</span>
            {tCat(lang, tp.id)}
          </button>
        ))}
      </div>
    </section>
  )
}
