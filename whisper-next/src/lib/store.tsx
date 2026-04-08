'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ---- Types ---- */
export type Category = 'sve' | 'ljubav' | 'blamovi' | 'misli' | 'random' | 'posao' | 'veze'

export interface Avatar { initials: string; color: string }

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
}

export interface DailyHighlight {
  title: string
  subtitle: string
  reactions: Record<string, number>
  userReactions: string[]
  commentCount: number
  postId: string
}

/* ---- Constants ---- */
export const CATEGORY_RGB: Record<Category, string> = {
  sve:     '255, 149, 0',
  ljubav:  '255, 69, 58',
  blamovi: '255, 159, 10',
  misli:   '191, 90, 242',
  random:  '50, 215, 75',
  posao:   '10, 132, 255',
  veze:    '255, 55, 95',
}

export const TOPICS = [
  { id: 'sve' as Category,     label: 'Sve',     emoji: '✨' },
  { id: 'ljubav' as Category,  label: 'Ljubav',  emoji: '❤️' },
  { id: 'blamovi' as Category, label: 'Blamovi', emoji: '😳' },
  { id: 'misli' as Category,   label: 'Misli',   emoji: '💭' },
  { id: 'random' as Category,  label: 'Random',  emoji: '🎲' },
  { id: 'posao' as Category,   label: 'Posao',   emoji: '💼' },
  { id: 'veze' as Category,    label: 'Veze',    emoji: '💔' },
]

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

const AVATAR_COLORS = ['#FF6B9D','#5856D6','#FF9500','#34C759','#007AFF','#AF52DE','#FF3B5C','#30B0C7','#FF2D92','#4CD964']

/* ---- Helpers ---- */
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return n.toString()
}

export function getAnonName(initials: string): string {
  return `Anonimni ${initials}`
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let sid = localStorage.getItem('whisper_session_id')
  if (!sid) { sid = 'sess_' + Math.random().toString(36).slice(2); localStorage.setItem('whisper_session_id', sid) }
  return sid
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffMin < 1) return 'upravo'
  if (diffMin < 60) return `pre ${diffMin}min`
  if (diffHour < 24) return `pre ${diffHour}h`
  if (diffDay < 7) return `pre ${diffDay}d`
  return date.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' })
}

function randomAvatar(): Avatar {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return {
    initials: letters[Math.floor(Math.random() * letters.length)] + Math.floor(Math.random() * 9),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  }
}

/* ---- Supabase row → Post ---- */
type SupabasePost = {
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
  profiles: { id: string; username: string | null; color: string | null; avatar_url: string | null } | null
}

type SupabaseReaction = { post_id: string; emoji: string; user_id: string | null; session_id: string | null }
type SupabaseComment = { id: string; post_id: string; user_id: string | null; text: string; image_url: string | null; created_at: string; profiles: { username: string | null; color: string | null; is_admin: boolean } | null }
type SupabaseCommentReaction = { comment_id: string; emoji: string; user_id: string | null; session_id: string | null }

function mapPost(
  row: SupabasePost,
  reactions: SupabaseReaction[],
  mySessionId: string,
  myUserId: string | null,
  comments: Comment[]
): Post {
  const postReactions = reactions.filter(r => r.post_id === row.id)
  const reactionCounts: Record<string, number> = {}
  const userReactions: string[] = []
  for (const r of postReactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    if ((myUserId && r.user_id === myUserId) || (!myUserId && r.session_id === mySessionId)) {
      if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
    }
  }

  const profile = row.profiles
  const authorUsername = row.is_admin ? 'Whisper' : (profile?.username ?? 'Korisnik')
  const initial = authorUsername[0].toUpperCase()
  const color = row.is_admin ? '#FF9500' : (profile?.color ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)])

  return {
    id: row.id,
    category: row.category,
    isAdmin: row.is_admin,
    adminCategory: row.admin_category as Category | undefined,
    userId: row.user_id,
    authorUsername,
    avatar: { initials: initial, color },
    title: row.title,
    text: row.text,
    image: row.image_url,
    reactions: reactionCounts,
    userReactions,
    commentCount: row.comment_count,
    time: formatTime(row.created_at),
    comments,
  }
}

function mapComment(
  row: SupabaseComment,
  commentReactions: SupabaseCommentReaction[],
  mySessionId: string,
  myUserId: string | null
): Comment {
  const mine = commentReactions.filter(r => r.comment_id === row.id)
  const reactionCounts: Record<string, number> = {}
  const userReactions: string[] = []
  for (const r of mine) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    if ((myUserId && r.user_id === myUserId) || (!myUserId && r.session_id === mySessionId)) {
      if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
    }
  }
  const isAdmin = row.profiles?.is_admin ?? false
  const username = isAdmin ? 'Whisper' : (row.profiles?.username ?? 'Korisnik')
  const initials = username[0].toUpperCase()
  const color = isAdmin ? '#FF9500' : (row.profiles?.color ?? AVATAR_COLORS[0])
  return {
    id: row.id,
    avatar: { initials, color },
    username,
    isAdmin,
    text: row.text,
    image: row.image_url,
    time: formatTime(row.created_at),
    reactions: reactionCounts,
    userReactions,
  }
}

/* ---- Context ---- */
interface StoreContextType {
  posts: Post[]
  loading: boolean
  user: User | null
  activeCategory: Category
  setActiveCategory: (c: Category) => void
  getDailyHighlight: (cat: Category) => Promise<DailyHighlight | null>
  getPostById: (id: string) => Post | undefined
  getPostsByCategory: (cat: Category) => Post[]
  getPostAuthor: (post: Post) => { name: string; color: string; avatarUrl?: string | null; initials: string; isMe: boolean }
  toggleReaction: (postId: string, emoji: string) => Promise<void>
  toggleCommentReaction: (postId: string, commentId: string, emoji: string) => Promise<void>
  addComment: (postId: string, text: string, image?: string | null) => Promise<void>
  removeComment: (postId: string, commentId: string) => Promise<void>
  addPost: (text: string, category: string, image?: string | null) => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (username: string, avatarImage?: string | null) => Promise<void>
  notifications: Notification[]
  markAllRead: () => void
  markOneRead: (id: string) => void
  deleteNotification: (id: string) => void
  showToast: (msg: string) => void
  toastMsg: string
  reload: () => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('sve')
  const [toastMsg, setToastMsg] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3200)
  }, [])

  const reload = useCallback(() => setReloadKey(k => k + 1), [])

  // Load Supabase auth user
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const su = data.session?.user
      if (su) {
        supabase.from('profiles').select('*').eq('id', su.id).single().then(({ data: profile }) => {
          if (profile) setUser({ id: su.id, email: su.email!, username: profile.username ?? su.email!, color: profile.color ?? '#FF9500', avatarUrl: profile.avatar_url, isAdmin: profile.is_admin })
        })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); return }
      const su = session.user
      supabase.from('profiles').select('*').eq('id', su.id).single().then(({ data: profile }) => {
        if (profile) setUser({ id: su.id, email: su.email!, username: profile.username ?? su.email!, color: profile.color ?? '#FF9500', avatarUrl: profile.avatar_url, isAdmin: profile.is_admin })
      })
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load notifications when user changes
  useEffect(() => {
    if (!user) { setNotifications([]); return }
    async function fetchNotifs() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) {
        setNotifications(data.map(n => ({
          id: n.id,
          postId: n.post_id,
          commentId: n.comment_id ?? null,
          type: (n.type ?? 'reaction') as 'comment' | 'reaction',
          commenterUsername: n.commenter_username,
          postText: n.post_text,
          read: n.read,
          time: formatTime(n.created_at),
        })))
      }
    }
    fetchNotifs()

    const channel = supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        const n = payload.new as { id: string; post_id: string; comment_id?: string | null; type?: string; commenter_username: string; post_text: string; read: boolean; created_at: string }
        setNotifications(prev => [{
          id: n.id,
          postId: n.post_id,
          commentId: n.comment_id ?? null,
          type: (n.type ?? 'reaction') as 'comment' | 'reaction',
          commenterUsername: n.commenter_username,
          postText: n.post_text,
          read: false,
          time: 'upravo',
        }, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const markAllRead = useCallback(async () => {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [user])

  const markOneRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Load posts from Supabase
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      const sessionId = getSessionId()
      const userId = user?.id ?? null

      const [postsRes, reactionsRes, commentsRes, commentReactionsRes] = await Promise.all([
        supabase.from('posts').select('*, profiles(id, username, color, avatar_url)').order('created_at', { ascending: false }),
        supabase.from('post_reactions').select('post_id, emoji, user_id, session_id'),
        supabase.from('comments').select('*, profiles(username, color, is_admin)').order('created_at', { ascending: false }),
        supabase.from('comment_reactions').select('comment_id, emoji, user_id, session_id'),
      ])

      if (postsRes.error) { console.error('Posts error:', postsRes.error); setLoading(false); return }

      const reactions = (reactionsRes.data ?? []) as SupabaseReaction[]
      const rawComments = (commentsRes.data ?? []) as SupabaseComment[]
      const commentReactions = (commentReactionsRes.data ?? []) as SupabaseCommentReaction[]

      const commentsByPost: Record<string, Comment[]> = {}
      for (const c of rawComments) {
        if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
        commentsByPost[c.post_id].push(mapComment(c, commentReactions, sessionId, userId))
      }

      const mapped = (postsRes.data as SupabasePost[]).map(row =>
        mapPost(row, reactions, sessionId, userId, commentsByPost[row.id] ?? [])
      )
      setPosts(mapped)
      setLoading(false)
    }
    fetchPosts()

    // Realtime: post reactions
    const sessionId = getSessionId()
    const userId = user?.id ?? null

    async function refetchReactions(postId: string) {
      const [reactionsRes] = await Promise.all([
        supabase.from('post_reactions').select('post_id, emoji, user_id, session_id').eq('post_id', postId),
      ])
      const reactions = (reactionsRes.data ?? []) as SupabaseReaction[]
      const reactionCounts: Record<string, number> = {}
      const userReactions: string[] = []
      for (const r of reactions) {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
        if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) {
          if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
        }
      }
      setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, reactions: reactionCounts, userReactions }))
    }

    const reactionsChannel = supabase
      .channel('post-reactions-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_reactions' }, payload => {
        const r = payload.new as { post_id: string; user_id: string | null; session_id: string | null }
        if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) return
        refetchReactions(r.post_id)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_reactions' }, payload => {
        const r = (payload.old ?? payload.new) as { post_id: string; user_id: string | null; session_id: string | null }
        if (!r?.post_id) return
        if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) return
        refetchReactions(r.post_id)
      })
      .subscribe(status => console.log('[RT] reactions channel:', status))

    // Realtime: new comments
    const commentsChannel = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, async payload => {
        const c = payload.new as { id: string; post_id: string; user_id: string | null; text: string; image_url: string | null; created_at: string }
        if (userId && c.user_id === userId) return
        let profile: { username: string | null; color: string | null; is_admin: boolean } | null = null
        if (c.user_id) {
          const { data } = await supabase.from('profiles').select('username, color, is_admin').eq('id', c.user_id).single()
          profile = data
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
        setPosts(prev => prev.map(p => p.id !== c.post_id ? p : { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, payload => {
        const c = payload.old as { id: string; post_id: string }
        if (!c?.post_id) return
        setPosts(prev => prev.map(p => p.id !== c.post_id ? p : {
          ...p,
          comments: p.comments.filter(cm => cm.id !== c.id),
          commentCount: Math.max(0, p.commentCount - 1),
        }))
      })
      .subscribe(status => console.log('[RT] comments channel:', status))

    return () => {
      supabase.removeChannel(reactionsChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [user, reloadKey])

  const getPostById = useCallback((id: string) => posts.find(p => p.id === id), [posts])

  const getPostsByCategory = useCallback((cat: Category): Post[] => {
    const regular = posts.filter(p => !p.isAdmin)
    if (!cat || cat === 'sve') return regular
    return regular.filter(p => p.category.toLowerCase() === cat.toLowerCase())
  }, [posts])

  const getPostAuthor = useCallback((post: Post) => {
    const isMe = !!(user && post.userId && post.userId === user.id)
    const name = isMe ? (user!.username || 'Ti') : (post.authorUsername || 'Korisnik')
    const color = isMe ? user!.color : post.avatar.color
    const avatarUrl = isMe ? user!.avatarUrl : null
    const initials = name[0].toUpperCase()
    return { name, color, avatarUrl, initials, isMe }
  }, [user])

  const getDailyHighlight = useCallback(async (cat: Category): Promise<DailyHighlight | null> => {
    const { data } = await supabase.from('daily_highlights').select('*').eq('category', cat).single()
    if (!data) return null

    const sessionId = getSessionId()
    const userId = user?.id ?? null

    // Get reactions for the linked post
    if (!data.post_id) return null
    const { data: reactions } = await supabase.from('post_reactions').select('emoji, user_id, session_id').eq('post_id', data.post_id)
    const reactionCounts: Record<string, number> = {}
    const userReactions: string[] = []
    for (const r of reactions ?? []) {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
      if ((userId && r.user_id === userId) || (!userId && r.session_id === sessionId)) {
        if (!userReactions.includes(r.emoji)) userReactions.push(r.emoji)
      }
    }
    const { count } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', data.post_id)

    return {
      title: data.title ?? '',
      subtitle: data.subtitle ?? '',
      reactions: reactionCounts,
      userReactions,
      commentCount: count ?? 0,
      postId: data.post_id,
    }
  }, [user])

  const toggleReaction = useCallback(async (postId: string, emoji: string) => {
    const sessionId = getSessionId()
    const userId = user?.id ?? null

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const already = p.userReactions.includes(emoji)
      return {
        ...p,
        reactions: { ...p.reactions, [emoji]: Math.max(0, (p.reactions[emoji] || 0) + (already ? -1 : 1)) },
        userReactions: already ? p.userReactions.filter(e => e !== emoji) : [...p.userReactions, emoji],
      }
    }))

    const post = posts.find(p => p.id === postId)
    if (!post) return
    const already = post.userReactions.includes(emoji)

    if (already) {
      if (userId) await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', userId).eq('emoji', emoji)
      else await supabase.from('post_reactions').delete().eq('post_id', postId).eq('session_id', sessionId).eq('emoji', emoji)
    } else {
      await supabase.from('post_reactions').insert({ post_id: postId, emoji, user_id: userId, session_id: userId ? null : sessionId })
      // Notify post owner (only logged-in users, skip self-reactions)
      if (userId && post.userId && post.userId !== userId) {
        await supabase.from('notifications').insert({
          user_id: post.userId,
          post_id: postId,
          type: 'reaction',
          commenter_username: user?.username ?? 'Korisnik',
          post_text: post.text.slice(0, 60),
        })
      }
    }
  }, [posts, user])

  const toggleCommentReaction = useCallback(async (postId: string, commentId: string, emoji: string) => {
    const sessionId = getSessionId()
    const userId = user?.id ?? null

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id !== commentId) return c
          const already = c.userReactions.includes(emoji)
          return {
            ...c,
            reactions: { ...c.reactions, [emoji]: Math.max(0, (c.reactions[emoji] || 0) + (already ? -1 : 1)) },
            userReactions: already ? c.userReactions.filter(e => e !== emoji) : [...c.userReactions, emoji],
          }
        }),
      }
    }))

    const comment = posts.find(p => p.id === postId)?.comments.find(c => c.id === commentId)
    if (!comment) return
    const already = comment.userReactions.includes(emoji)

    if (already) {
      if (userId) await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', userId).eq('emoji', emoji)
      else await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('session_id', sessionId).eq('emoji', emoji)
    } else {
      await supabase.from('comment_reactions').insert({ comment_id: commentId, emoji, user_id: userId, session_id: userId ? null : sessionId })
    }
  }, [posts, user])

  const addComment = useCallback(async (postId: string, text: string, image?: string | null) => {
    const userId = user?.id ?? null
    let imageUrl: string | null = null

    // Upload image to Supabase Storage if provided
    if (image) {
      const base64 = image.split(',')[1]
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'image/jpeg' })
      const path = `comments/${Date.now()}.jpg`
      const { data: upload } = await supabase.storage.from('whisper-images').upload(path, blob, { contentType: 'image/jpeg' })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('whisper-images').getPublicUrl(path)
        imageUrl = publicUrl
      }
    }

    const { data: newComment } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, text, image_url: imageUrl })
      .select()
      .single()

    if (!newComment) return

    // Update comment_count + notify post owner
    const post = posts.find(p => p.id === postId)
    if (post) {
      await supabase.from('posts').update({ comment_count: post.commentCount + 1 }).eq('id', postId)
      // Send notification to post owner (skip if commenter is the owner)
      if (post.userId && post.userId !== userId) {
        await supabase.from('notifications').insert({
          user_id: post.userId,
          post_id: postId,
          comment_id: newComment.id,
          type: 'comment',
          commenter_username: user?.username ?? 'Korisnik',
          post_text: post.text.slice(0, 60),
        })
      }
    }

    const isAdmin = user?.isAdmin ?? false
    const username = isAdmin ? 'Whisper' : (user?.username ?? 'Korisnik')
    const initials = username[0].toUpperCase()
    const color = isAdmin ? '#FF9500' : (user?.color ?? AVATAR_COLORS[0])
    const mapped: Comment = {
      id: newComment.id,
      avatar: { initials, color },
      username,
      isAdmin,
      text: newComment.text,
      image: newComment.image_url,
      time: 'upravo',
      reactions: {},
      userReactions: [],
      isNew: true,
    }

    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      comments: [...p.comments, mapped],
      commentCount: p.commentCount + 1,
    }))
  }, [user, posts])

  const removeComment = useCallback(async (postId: string, commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      comments: p.comments.filter(c => c.id !== commentId),
      commentCount: Math.max(0, p.commentCount - 1),
    }))
    // Update comment_count in DB
    const post = posts.find(p => p.id === postId)
    if (post) await supabase.from('posts').update({ comment_count: Math.max(0, post.commentCount - 1) }).eq('id', postId)
  }, [posts])

  const addPost = useCallback(async (text: string, category: string, image?: string | null) => {
    const userId = user?.id ?? null
    let imageUrl: string | null = null

    if (image) {
      const base64 = image.split(',')[1]
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'image/jpeg' })
      const path = `posts/${Date.now()}.jpg`
      const { data: upload } = await supabase.storage.from('whisper-images').upload(path, blob, { contentType: 'image/jpeg' })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('whisper-images').getPublicUrl(path)
        imageUrl = publicUrl
      }
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({ user_id: userId, category, text, image_url: imageUrl, is_admin: false, comment_count: 0 })
      .select('*, profiles(id, username, color, avatar_url)')
      .single()

    if (error || !newPost) { showToast('Greška pri slanju. Pokušaj ponovo.'); return }

    const mapped = mapPost(newPost as SupabasePost, [], getSessionId(), userId, [])
    setPosts(prev => [mapped, ...prev])
    showToast('Priča podeljena! 🎉 Hvala ti što si to uradio/la.')
  }, [user, showToast])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return false
    showToast('Dobrodošao/la nazad! 👋')
    return true
  }, [showToast])

  const signup = useCallback(async (email: string, username: string, password: string): Promise<boolean> => {
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, color } } })
    if (error || !data.user) return false

    await supabase.from('profiles').upsert({ id: data.user.id, username, color, is_admin: false })
    showToast('Nalog kreiran! Dobrodošao/la 🎉')
    return true
  }, [showToast])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    showToast('Odjavljen/a si. Vidimo se! 👋')
  }, [showToast])

  const updateProfile = useCallback(async (username: string, avatarImage?: string | null) => {
    if (!user) return
    let avatarUrl = user.avatarUrl ?? null

    if (avatarImage && avatarImage.startsWith('data:')) {
      const base64 = avatarImage.split(',')[1]
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'image/jpeg' })
      const path = `avatars/${user.id}.jpg`
      const { data: upload } = await supabase.storage.from('whisper-images').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('whisper-images').getPublicUrl(path)
        avatarUrl = publicUrl
      }
    }

    await supabase.from('profiles').update({ username, avatar_url: avatarUrl }).eq('id', user.id)
    setUser(prev => prev ? { ...prev, username, avatarUrl } : prev)
    showToast('Profil sačuvan! ✅')
  }, [user, showToast])

  return (
    <StoreContext.Provider value={{
      posts, loading, user, activeCategory, setActiveCategory,
      getDailyHighlight, getPostById, getPostsByCategory, getPostAuthor,
      toggleReaction, toggleCommentReaction, addComment, removeComment, addPost,
      login, signup, logout, updateProfile, showToast, toastMsg, reload,
      notifications, markAllRead, markOneRead, deleteNotification,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
