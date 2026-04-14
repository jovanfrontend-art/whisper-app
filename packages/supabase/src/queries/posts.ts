import type { SupabaseClient } from '@supabase/supabase-js'
import { mapPost } from '../mappers'
import { getSessionId } from '@whisper/shared'
import type { Post } from '@whisper/shared'
import type { SupabasePost, SupabaseReaction, SupabaseComment, SupabaseCommentReaction } from '../types'
import { mapComment } from '../mappers'

export async function fetchAllPosts(
  client: SupabaseClient,
  userId: string | null
): Promise<Post[]> {
  const sessionId = getSessionId()

  const [postsRes, reactionsRes, commentsRes, commentReactionsRes] = await Promise.all([
    client.from('posts').select('*, profiles(id, username, color, avatar_url)').order('created_at', { ascending: false }),
    client.from('post_reactions').select('post_id, emoji, user_id, session_id'),
    client.from('comments').select('*, profiles(username, color, is_admin)').order('created_at', { ascending: false }),
    client.from('comment_reactions').select('comment_id, emoji, user_id, session_id'),
  ])

  if (postsRes.error) throw postsRes.error

  const reactions = (reactionsRes.data ?? []) as SupabaseReaction[]
  const rawComments = (commentsRes.data ?? []) as SupabaseComment[]
  const commentReactions = (commentReactionsRes.data ?? []) as SupabaseCommentReaction[]

  const commentsByPost: Record<string, ReturnType<typeof mapComment>[]> = {}
  for (const c of rawComments) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
    commentsByPost[c.post_id].push(mapComment(c, commentReactions, sessionId, userId))
  }

  return (postsRes.data as SupabasePost[]).map(row =>
    mapPost(row, reactions, sessionId, userId, commentsByPost[row.id] ?? [])
  )
}

export async function addPost(
  client: SupabaseClient,
  userId: string | null,
  text: string,
  category: string,
  imageUrl: string | null
): Promise<Post> {
  const { data: newPost, error } = await client
    .from('posts')
    .insert({ user_id: userId, category, text, image_url: imageUrl, is_admin: false, comment_count: 0 })
    .select('*, profiles(id, username, color, avatar_url)')
    .single()

  if (error || !newPost) throw error ?? new Error('Failed to create post')
  return mapPost(newPost as SupabasePost, [], getSessionId(), userId, [])
}

export async function deletePost(client: SupabaseClient, postId: string): Promise<void> {
  await client.from('posts').delete().eq('id', postId)
}

export async function fetchPostReactions(
  client: SupabaseClient,
  postId: string
): Promise<SupabaseReaction[]> {
  const { data } = await client
    .from('post_reactions')
    .select('post_id, emoji, user_id, session_id')
    .eq('post_id', postId)
  return (data ?? []) as SupabaseReaction[]
}
