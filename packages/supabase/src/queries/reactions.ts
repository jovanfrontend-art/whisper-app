import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertPostReaction(
  client: SupabaseClient,
  postId: string,
  emoji: string,
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  await client.from('post_reactions').insert({
    post_id: postId,
    emoji,
    user_id: userId,
    session_id: sessionId,
  })
}

export async function deletePostReaction(
  client: SupabaseClient,
  postId: string,
  emoji: string,
  userId: string | null,
  sessionId: string
): Promise<void> {
  if (userId) {
    await client.from('post_reactions').delete().eq('post_id', postId).eq('user_id', userId).eq('emoji', emoji)
  } else {
    await client.from('post_reactions').delete().eq('post_id', postId).eq('session_id', sessionId).eq('emoji', emoji)
  }
}

export async function insertCommentReaction(
  client: SupabaseClient,
  commentId: string,
  emoji: string,
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  await client.from('comment_reactions').insert({
    comment_id: commentId,
    emoji,
    user_id: userId,
    session_id: sessionId,
  })
}

export async function deleteCommentReaction(
  client: SupabaseClient,
  commentId: string,
  emoji: string,
  userId: string | null,
  sessionId: string
): Promise<void> {
  if (userId) {
    await client.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', userId).eq('emoji', emoji)
  } else {
    await client.from('comment_reactions').delete().eq('comment_id', commentId).eq('session_id', sessionId).eq('emoji', emoji)
  }
}
