'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@whisper/supabase'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import TopicTabs from '@/components/feed/TopicTabs'
import DailyHighlightCard from '@/components/feed/DailyHighlightCard'
import PostCard from '@/components/feed/PostCard'
import ComposeModal from '@/components/feed/ComposeModal'
import SearchOverlay from '@/components/search/SearchOverlay'
import ProfileOverlay from '@/components/profile/ProfileOverlay'
import AuthModal from '@/components/auth/AuthModal'
import { PostSkeleton } from '@/components/ui/Preloader'
import { translateBatch } from '@/lib/translate'
import { t } from '@/lib/i18n'

export default function Home() {
  const { activeCategory, getPostsByCategory, loading, user } = useStore()
  const [composeOpen, setComposeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 300)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (loading) return
    setTransitioning(true)
    const t = setTimeout(() => setTransitioning(false), 300)
    return () => clearTimeout(t)
  }, [activeCategory, loading])

  const posts = getPostsByCategory(activeCategory)
  const userLang = user?.language
  const postIds = posts.map(p => p.id).join(',')

  useEffect(() => {
    if (!userLang || loading || !postIds) {
      setTranslations(prev => Object.keys(prev).length === 0 ? prev : {})
      setTranslating(false)
      return
    }
    let cancelled = false
    setTranslations({})
    setTranslating(true)
    const currentPosts = getPostsByCategory(activeCategory)
    translateBatch(currentPosts.map(p => p.text), userLang).then(results => {
      if (cancelled) return
      const map: Record<string, string> = {}
      currentPosts.forEach((p, i) => { map[p.id] = results[i] })
      setTranslations(map)
      setTranslating(false)
    })
    return () => { cancelled = true }
  }, [postIds, userLang, loading])

  return (
    <>
      <AppHeader />

      <main className="feed-container">
        <TopicTabs />
        <DailyHighlightCard />

        <div className="feed-section-header">
          <span className="feed-section-title">{t(userLang, 'storiesTitle')}</span>
          {!loading && !transitioning && <span className="feed-section-count">{posts.length}</span>}
        </div>

        <div className="posts-list">
          {loading || transitioning ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">🌐</span>
              <h3>{t(userLang, 'noStoriesTitle')}</h3>
              <p>{t(userLang, 'noStoriesDesc')}</p>
            </div>
          ) : (
            posts.map((post, i) => <PostCard key={post.id} post={post} index={i} translatedText={translations[post.id]} translating={translating} />)
          )}
        </div>
      </main>

      <button
        className={`back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      </button>

      <BottomNav
        onCompose={() => setComposeOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onProfile={() => setProfileOpen(true)}
      />

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProfileOverlay
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLoginClick={() => { setProfileOpen(false); setAuthOpen(true) }}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
