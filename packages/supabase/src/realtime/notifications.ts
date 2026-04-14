import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { Notification } from '@whisper/shared'
import type { SupabaseNotification } from '../types'

export function subscribeToNotifications(
  client: SupabaseClient,
  userId: string,
  onNew: (notification: Notification) => void
): RealtimeChannel {
  return client
    .channel('notifications-' + userId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      payload => {
        const n = payload.new as SupabaseNotification
        onNew({
          id: n.id,
          postId: n.post_id,
          commentId: n.comment_id ?? null,
          type: (n.type ?? 'reaction') as 'comment' | 'reaction',
          commenterUsername: n.commenter_username,
          postText: n.post_text,
          read: false,
          time: 'upravo',
        })
      }
    )
    .subscribe()
}
