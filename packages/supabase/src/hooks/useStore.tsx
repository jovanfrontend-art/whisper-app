import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Post, User, Category, DailyHighlight, Notification, Comment } from '@whisper/shared'
import { createWhisperClient } from '../client'
import { useAuth } from './useAuth'
import { usePosts } from './usePosts'
import { useNotifications } from './useNotifications'
import type { SignUpResult } from '../queries/auth'
import { t } from '@whisper/shared'

export type { SignUpResult }

export interface StoreContextType {
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
  signup: (email: string, username: string, password: string, language?: string) => Promise<SignUpResult>
  logout: () => Promise<void>
  updateProfile: (username: string, avatarImage?: string | null, language?: string) => Promise<void>
  notifications: Notification[]
  markAllRead: () => void
  markOneRead: (id: string) => void
  deleteNotification: (id: string) => void
  showToast: (msg: string) => void
  toastMsg: string
  reload: () => void
}

const StoreContext = createContext<StoreContextType | null>(null)

interface StoreProviderProps {
  children: ReactNode
  supabaseUrl: string
  supabaseKey: string
}

export function StoreProvider({ children, supabaseUrl, supabaseKey }: StoreProviderProps) {
  const client = useMemo(() => createWhisperClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey])
  const [activeCategory, setActiveCategory] = useState<Category>('sve')
  const [toastMsg, setToastMsg] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const auth = useAuth(client)
  const postsStore = usePosts(client, auth.user, reloadKey)
  const notifStore = useNotifications(client, auth.user)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3200)
  }, [])

  const reload = useCallback(() => setReloadKey(k => k + 1), [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const ok = await auth.login(email, password)
    if (ok) showToast(t(auth.user?.language, 'toastWelcomeBack'))
    return ok
  }, [auth, showToast])

  const signup = useCallback(async (email: string, username: string, password: string, language?: string): Promise<SignUpResult> => {
    const result = await auth.signup(email, username, password, language)
    if (result.status === 'ok') showToast(t(language, 'toastSignupOk'))
    return result
  }, [auth, showToast])

  const logout = useCallback(async () => {
    const lang = auth.user?.language
    await auth.logout()
    showToast(t(lang, 'toastLogout'))
  }, [auth, showToast])

  const addPost = useCallback(async (text: string, category: string, image?: string | null) => {
    const lang = auth.user?.language
    try {
      await postsStore.addPost(text, category, image)
      showToast(t(lang, 'toastPostShared'))
    } catch {
      showToast(t(lang, 'toastPostError'))
    }
  }, [auth.user, postsStore, showToast])

  return (
    <StoreContext.Provider value={{
      ...postsStore,
      ...notifStore,
      user: auth.user,
      activeCategory,
      setActiveCategory,
      login,
      signup,
      logout,
      updateProfile: auth.updateProfile,
      showToast,
      toastMsg,
      reload,
      addPost,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
