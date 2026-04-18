'use client'
import { useStore } from '@whisper/supabase'
import type { Post } from '@whisper/shared'
import { formatCount } from '@whisper/shared'
import Avatar from '@/components/ui/Avatar'
import ReactionBar from '@/components/ui/ReactionBar'
import { useRouter } from 'next/navigation'
import { t, tCat } from '@/lib/i18n'

export default function PostCard({ post, index = 0, translatedText, translating }: { post: Post; index?: number; translatedText?: string; translating?: boolean }) {
  const { getPostAuthor, toggleReaction, user } = useStore()
  const router = useRouter()
  const author = getPostAuthor(post)
  const lang = user?.language

  const catClass = post.category ? `cat-${post.category.toLowerCase()}` : ''

  return (
    <article
      className="post-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => router.push(`/thread/${post.id}`)}
    >
      <div className="post-card-header">
        <div className="post-card-meta">
          <Avatar initials={author.initials} color={author.color} avatarImage={author.avatarUrl} />
          <div className="post-card-info">
            <span className="post-card-anon">{author.name}</span>
            <span className="post-card-time">{post.time}</span>
          </div>
        </div>
        <span className={`cat-pill ${catClass}`}>{tCat(lang, post.category) || post.category}</span>
      </div>

      {translating ? (
        <div className="post-text-skeleton">
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6, width: '85%' }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '60%' }} />
        </div>
      ) : (
        <p className={`post-text${translatedText ? ' translated-fade' : ''}`}>{translatedText || post.text}</p>
      )}

      {post.image && (
        <div className="post-image-wrap">
          <img className="post-image" src={post.image} alt="" loading="lazy" />
        </div>
      )}

      <div onClick={e => e.stopPropagation()}>
        <ReactionBar
          reactions={post.reactions}
          userReactions={post.userReactions}
          onToggle={(emoji) => toggleReaction(post.id, emoji)}
        />
      </div>

      <div className="post-card-footer">
        <div className="post-comments-info">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {formatCount(post.comments.length)} {t(lang, 'commentCount')}
        </div>
        <button
          className="btn-enter-thread"
          onClick={e => { e.stopPropagation(); router.push(`/thread/${post.id}`) }}
        >
          {t(lang, 'enterThread')}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </article>
  )
}
