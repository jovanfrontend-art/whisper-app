import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { Comment } from '@whisper/shared'
import { fetchPostReactions } from '../queries/posts'
import { fetchProfile } from '../queries/comments'
import { formatTime, AVATAR_COLORS } from '@whisper/shared'

type ReactionUpdateCallback = (postId: string, reactions: Record<string, number>, userReactions: string[]) => void
type CommentAddCallback = (postId: string, comment: Comment) => void
type CommentDeleteCallback = (postId: string, commentId: string) => void

export function subscribeToPostReactions(
  client: SupabaseClient,
  userId: string | null,
  sessionId: string,
  onUpdate: ReactionUpdateCallback
): RealtimeChannel {
  return client
    .channel('post-reactions-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_reactions' }, async payload => {
      const r = payload.new as { post_id: string; user_id: string | null; session_id: string | null }
      if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) return
      const reactions = await fetchPostReactions(client, r.post_id)
      const reactionCounts: Record<string, number> = {}
      const userReactions: string[] = []
      for (const rx of reactions) {
        reactionCounts[rx.emoji] = (reactionCounts[rx.emoji] || 0) + 1
        if ((userId && rx.user_id === userId) || (!userId && rx.session_id === sessionId)) {
          if (!userReactions.includes(rx.emoji)) userReactions.push(rx.emoji)
        }
      }
      onUpdate(r.post_id, reactionCounts, userReactions)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_reactions' }, async payload => {
      const r = (payload.old ?? payload.new) as { post_id: string; user_id: string | null; session_id: string | null }
      if (!r?.post_id) return
      if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) return
      const reactions = await fetchPostReactions(client, r.post_id)
      const reactionCounts: Record<string, number> = {}
      const userReactions: string[] = []
      for (const rx of reactions) {
        reactionCounts[rx.emoji] = (reactionCounts[rx.emoji] || 0) + 1
        if ((userId && rx.user_id === userId) || (!userId && rx.session_id === sessionId)) {
          if (!userReactions.includes(rx.emoji)) userReactions.push(rx.emoji)
        }
      }
      onUpdate(r.post_id, reactionCounts, userReactions)
    })
    .subscribe()
}

export function subscribeToComments(
  client: SupabaseClient,
  userId: string | null,
  onAdd: CommentAddCallback,
  onDelete: CommentDeleteCallback
): RealtimeChannel {
  return client
    .channel('comments-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, async payload => {
      const c = payload.new as { id: string; post_id: string; user_id: string | null; text: string; image_url: string | null; created_at: string }
      if (userId && c.user_id === userId) return
      let profile: { username: string | null; color: string | null; is_admin: boolean } | null = null
      if (c.user_id) {
        profile = await fetchProfile(client, c.user_id)
      }
      const isAdmin = profile?.is_admin ?? false
      const username = isAdmin ? 'Whisper' : (profile?.username ?? 'Korisnik')
      const newComment: Comment = {
        id: c.id,
        avatar: { initials: username[0].toUpperCase(), color: isAdmin ? '#FF9500' : (profile?.color ?? AVATAR_COLORS[0]) },
        username, isAdmin,
        text: c.text, image: c.image_url,
        time: formatTime(c.created_at),
        reactions: {}, userReactions: [], isNew: true,
      }
      onAdd(c.post_id, newComment)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, payload => {
      const c = payload.old as { id: string; post_id: string }
      if (!c?.post_id) return
      onDelete(c.post_id, c.id)
    })
    .subscribe()
}
