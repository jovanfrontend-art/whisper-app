import { AVATAR_COLORS, formatTime } from '@whisper/shared'
import type { Post, Comment, Category } from '@whisper/shared'
import type { SupabasePost, SupabaseReaction, SupabaseComment, SupabaseCommentReaction } from './types'

export function mapPost(
  row: SupabasePost,
  reactions: SupabaseReaction[],
  mySessionId: string,
  myUserId: string | null,
  comments: Comment[]
): Post {
  const postReactions = reactions.filter(r => r.post_id === row.id)
  const reactionCounts: Record<string, number> = {}
  const userReactions: string[] = []
  for (const r of postReactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    if ((myUserId && r.user_id === myUserId) || (!myUserId && r.session_id === mySessionId)) {
      if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
    }
  }

  const profile = row.profiles
  const authorUsername = row.is_admin ? 'Whisper' : (profile?.username ?? 'Korisnik')
  const initial = authorUsername[0].toUpperCase()
  const color = row.is_admin
    ? '#FF9500'
    : (profile?.color ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)])

  const avatarUrl = row.is_admin ? null : (profile?.avatar_url ?? null)

  return {
    id: row.id,
    category: row.category,
    isAdmin: row.is_admin,
    adminCategory: row.admin_category as Category | undefined,
    userId: row.user_id,
    authorUsername,
    avatar: { initials: initial, color, avatarUrl },
    title: row.title,
    text: row.text,
    image: row.image_url,
    reactions: reactionCounts,
    userReactions,
    commentCount: row.comment_count,
    time: formatTime(row.created_at),
    comments,
  }
}

export function mapComment(
  row: SupabaseComment,
  commentReactions: SupabaseCommentReaction[],
  mySessionId: string,
  myUserId: string | null
): Comment {
  const mine = commentReactions.filter(r => r.comment_id === row.id)
  const reactionCounts: Record<string, number> = {}
  const userReactions: string[] = []
  for (const r of mine) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    if ((myUserId && r.user_id === myUserId) || (!myUserId && r.session_id === mySessionId)) {
      if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
    }
  }
  const isAdmin = row.profiles?.is_admin ?? false
  const username = isAdmin ? 'Whisper' : (row.profiles?.username ?? 'Korisnik')
  const initials = username[0].toUpperCase()
  const color = isAdmin ? '#FF9500' : (row.profiles?.color ?? AVATAR_COLORS[0])
  return {
    id: row.id,
    avatar: { initials, color },
    username,
    isAdmin,
    text: row.text,
    image: row.image_url,
    time: formatTime(row.created_at),
    reactions: reactionCounts,
    userReactions,
  }
}
