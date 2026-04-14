'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@whisper/supabase'

export default function Preloader() {
  const { loading } = useStore()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!loading) {
      // Kratki delay da animacija bude plava prije nego nestane
      const t = setTimeout(() => setVisible(false), 400)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <div className={`app-preloader${visible ? '' : ' hidden'}`}>
      <div className="app-preloader-logo">
        WhisperX<span>.</span>
      </div>
      <div className="app-preloader-bar" />
    </div>
  )
}

// Skeleton za jednu post karticu
export function PostSkeleton() {
  return (
    <div className="post-skeleton">
      <div className="post-skeleton-header">
        <div className="post-skeleton-avatar skeleton" />
        <div className="post-skeleton-meta">
          <div className="post-skeleton-name skeleton" />
          <div className="post-skeleton-time skeleton" />
        </div>
      </div>
      <div className="post-skeleton-text skeleton" />
      <div className="post-skeleton-text skeleton short" />
      <div className="post-skeleton-footer">
        <div className="post-skeleton-reaction skeleton" />
        <div className="post-skeleton-reaction skeleton" />
        <div className="post-skeleton-reaction skeleton" />
      </div>
    </div>
  )
}
