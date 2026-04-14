// Raw Supabase DB row shapes (internal to @whisper/supabase)
export type SupabasePost = {
  id: string
  user_id: string | null
  category: string
  title: string | null
  text: string
  image_url: string | null
  comment_count: number
  is_admin: boolean
  admin_category: string | null
  created_at: string
  profiles: {
    id: string
    username: string | null
    color: string | null
    avatar_url: string | null
  } | null
}

export type SupabaseReaction = {
  post_id: string
  emoji: string
  user_id: string | null
  session_id: string | null
}

export type SupabaseComment = {
  id: string
  post_id: string
  user_id: string | null
  text: string
  image_url: string | null
  created_at: string
  profiles: {
    username: string | null
    color: string | null
    is_admin: boolean
  } | null
}

export type SupabaseCommentReaction = {
  comment_id: string
  emoji: string
  user_id: string | null
  session_id: string | null
}

export type SupabaseNotification = {
  id: string
  post_id: string
  comment_id?: string | null
  type?: string
  commenter_username: string
  post_text: string
  read: boolean
  created_at: string
}
