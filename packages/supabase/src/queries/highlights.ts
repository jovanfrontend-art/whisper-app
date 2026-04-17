import type { SupabaseClient } from '@supabase/supabase-js'
import { getSessionId } from '@whisper/shared'
import type { DailyHighlight, Category } from '@whisper/shared'

export async function getDailyHighlight(
  client: SupabaseClient,
  cat: Category,
  userId: string | null
): Promise<DailyHighlight | null> {
  const { data } = await client.from('daily_highlights').select('*').eq('category', cat).single()
  if (!data || (!data.title && !data.subtitle)) return null

  if (!data.post_id) {
    return {
      title: data.title,
      subtitle: data.subtitle ?? '',
      reactions: {},
      userReactions: [],
      commentCount: 0,
      postId: null,
    }
  }

  const sessionId = getSessionId()
  const { data: reactions } = await client
    .from('post_reactions')
    .select('emoji, user_id, session_id')
    .eq('post_id', data.post_id)

  const reactionCounts: Record<string, number> = {}
  const userReactions: string[] = []
  for (const r of reactions ?? []) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) {
      if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
    }
  }

  const { count } = await client
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', data.post_id)

  return {
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    reactions: reactionCounts,
    userReactions,
    commentCount: count ?? 0,
    postId: data.post_id,
  }
}
