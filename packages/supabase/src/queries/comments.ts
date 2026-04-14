import type { SupabaseClient } from '@supabase/supabase-js'

export async function addComment(
  client: SupabaseClient,
  postId: string,
  userId: string | null,
  text: string,
  imageUrl: string | null
): Promise<{ id: string; text: string; image_url: string | null }> {
  const { data, error } = await client
    .from('comments')
    .insert({ post_id: postId, user_id: userId, text, image_url: imageUrl })
    .select()
    .single()
  if (error || !data) throw error ?? new Error('Failed to add comment')
  return data
}

export async function removeComment(
  client: SupabaseClient,
  commentId: string
): Promise<void> {
  await client.from('comments').delete().eq('id', commentId)
}

export async function fetchProfile(
  client: SupabaseClient,
  userId: string
): Promise<{ username: string | null; color: string | null; is_admin: boolean } | null> {
  const { data } = await client
    .from('profiles')
    .select('username, color, is_admin')
    .eq('id', userId)
    .single()
  return data
}
