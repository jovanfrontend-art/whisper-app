export type Category = 'sve' | 'ljubav' | 'blamovi' | 'misli' | 'random' | 'posao' | 'veze'

export interface Avatar {
  initials: string
  color: string
  avatarUrl?: string | null
}

export interface Comment {
  id: string
  avatar: Avatar
  username: string
  isAdmin?: boolean
  text: string
  image?: string | null
  time: string
  reactions: Record<string, number>
  userReactions: string[]
  isNew?: boolean
}

export interface Post {
  id: string
  category: string
  isAdmin?: boolean
  adminCategory?: Category
  userId?: string | null
  authorUsername?: string
  avatar: Avatar
  title?: string | null
  text: string
  image?: string | null
  reactions: Record<string, number>
  userReactions: string[]
  commentCount: number
  time: string
  comments: Comment[]
}

export interface User {
  id: string
  email: string
  username: string
  color: string
  avatarUrl?: string | null
  isAdmin?: boolean
  language?: string
}

export interface DailyHighlight {
  title: string
  subtitle: string
  reactions: Record<string, number>
  userReactions: string[]
  commentCount: number
  postId: string | null
}

export interface Notification {
  id: string
  postId: string
  commentId?: string | null
  type: 'comment' | 'reaction'
  commenterUsername: string
  postText: string
  read: boolean
  time: string
}
