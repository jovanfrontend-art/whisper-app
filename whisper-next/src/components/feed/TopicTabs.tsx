'use client'
import { useStore, TOPICS, Category } from '@/lib/store'

export default function TopicTabs() {
  const { activeCategory, setActiveCategory } = useStore()

  return (
    <section className="topics-section">
      <div className="topics-label">Teme</div>
      <div className="topics-scroll">
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
