'use client'
import { useStore, Post, formatCount } from '@/lib/store'
import Avatar from '@/components/ui/Avatar'
import ReactionBar from '@/components/ui/ReactionBar'
import { useRouter } from 'next/navigation'

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { getPostAuthor, toggleReaction } = useStore()
  const router = useRouter()
  const author = getPostAuthor(post)

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
        <span className={`cat-pill ${catClass}`}>{post.category}</span>
      </div>

      <p className="post-text">{post.text}</p>

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
          {formatCount(post.commentCount)} komentara
        </div>
        <button
          className="btn-enter-thread"
          onClick={e => { e.stopPropagation(); router.push(`/thread/${post.id}`) }}
        >
          Ući u priču
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </article>
  )
}
