import type { SupabaseClient } from '@supabase/supabase-js'
import { formatTime } from '@whisper/shared'
import type { Notification } from '@whisper/shared'
import type { SupabaseNotification } from '../types'

export async function fetchNotifications(
  client: SupabaseClient,
  userId: string
): Promise<Notification[]> {
  const { data } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  return (data ?? []).map((n: SupabaseNotification) => ({
    id: n.id,
    postId: n.post_id,
    commentId: n.comment_id ?? null,
    type: (n.type ?? 'reaction') as 'comment' | 'reaction',
    commenterUsername: n.commenter_username,
    postText: n.post_text,
    read: n.read,
    time: formatTime(n.created_at),
  }))
}

export async function markAllNotificationsRead(
  client: SupabaseClient,
  userId: string
): Promise<void> {
  await client.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export async function markNotificationRead(
  client: SupabaseClient,
  id: string
): Promise<void> {
  await client.from('notifications').update({ read: true }).eq('id', id)
}

export async function deleteNotification(
  client: SupabaseClient,
  id: string
): Promise<void> {
  await client.from('notifications').delete().eq('id', id)
}

export async function insertNotification(
  client: SupabaseClient,
  payload: {
    user_id: string
    post_id: string
    comment_id?: string
    type: 'comment' | 'reaction'
    commenter_username: string
    post_text: string
  }
): Promise<void> {
  await client.from('notifications').insert(payload)
}
