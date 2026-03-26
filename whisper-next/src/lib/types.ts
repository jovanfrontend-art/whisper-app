export type Category = 'sve' | 'ljubav' | 'blamovi' | 'misli' | 'random' | 'posao' | 'veze'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  color: string | null
  is_admin: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string | null
  category: Category
  title: string | null
  text: string
  image_url: string | null
  comment_count: number
  is_admin: boolean
  admin_category: Category | null
  created_at: string
  profiles?: Profile | null
}

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  text: string
  image_url: string | null
  created_at: string
  profiles?: Profile | null
}

export interface PostReaction {
  id: string
  post_id: string
  user_id: string | null
  session_id: string | null
  emoji: string
}

export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string | null
  session_id: string | null
  emoji: string
}

export interface DailyHighlight {
  id: string
  category: Category
  title: string | null
  subtitle: string | null
  post_id: string | null
  updated_at: string
}

export interface ReactionCount {
  emoji: string
  count: number
  reacted: boolean
}
