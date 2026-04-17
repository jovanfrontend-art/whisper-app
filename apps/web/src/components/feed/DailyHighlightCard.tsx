'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@whisper/supabase'
import type { Category, DailyHighlight } from '@whisper/shared'
import { CATEGORY_RGB } from '@whisper/shared'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import { translateBatch } from '@/lib/translate'

export default function DailyHighlightCard() {
  const { activeCategory, getDailyHighlight, user } = useStore()
  const router = useRouter()
  const [highlight, setHighlight] = useState<DailyHighlight | null>(null)
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null)
  const [translatedSubtitle, setTranslatedSubtitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const lang = user?.language

  useEffect(() => {
    setLoading(true)
    setTranslatedTitle(null)
    setTranslatedSubtitle(null)
    getDailyHighlight(activeCategory).then(h => {
      setHighlight(h)
      setLoading(false)
    })
  }, [activeCategory, getDailyHighlight])

  useEffect(() => {
    if (!highlight || !lang) {
      setTranslating(false)
      return
    }
    let cancelled = false
    setTranslatedTitle(null)
    setTranslatedSubtitle(null)
    setTranslating(true)
    translateBatch([highlight.title, highlight.subtitle], lang).then(([title, subtitle]) => {
      if (cancelled) return
      setTranslatedTitle(title)
      setTranslatedSubtitle(subtitle)
      setTranslating(false)
    })
    return () => { cancelled = true }
  }, [highlight, lang])

  const rgb = CATEGORY_RGB[activeCategory] || CATEGORY_RGB.sve

  if (loading) {
    return (
      <div className="daily-highlight" style={{ '--daily-rgb': rgb } as React.CSSProperties}>
        <div className="daily-tag">✨ {t(lang, 'topicLabel')}</div>
        <div className="daily-title skeleton" style={{ height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.08)', width: '70%' }} />
        <p className="daily-text skeleton" style={{ height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginTop: 8 }} />
      </div>
    )
  }

  if (!highlight) return null

  return (
    <div className="daily-highlight" style={{ '--daily-rgb': rgb } as React.CSSProperties}>
      <div className="daily-tag">✨ {t(lang, 'topicLabel')}</div>
      {translating ? (
        <>
          <div className="skeleton" style={{ height: 22, borderRadius: 6, marginBottom: 8, width: '70%' }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '50%' }} />
        </>
      ) : (
        <>
          <div className="daily-title">{translatedTitle || highlight.title}</div>
          <p className="daily-text">{translatedSubtitle || highlight.subtitle}</p>
        </>
      )}
    </div>
  )
}
