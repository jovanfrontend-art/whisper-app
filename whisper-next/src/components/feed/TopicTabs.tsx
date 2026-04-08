'use client'
import { useRef } from 'react'
import { useStore, TOPICS, Category } from '@/lib/store'

export default function TopicTabs() {
  const { activeCategory, setActiveCategory } = useStore()
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

    const currentIndex = TOPICS.findIndex(t => t.id === activeCategory)
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
      <div className="topics-label">Teme</div>
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
        {TOPICS.map(t => (
          <button
            key={t.id}
            className={`topic-chip${activeCategory === t.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(t.id as Category)}
          >
            <span className="topic-chip-emoji">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
    </section>
  )
}
