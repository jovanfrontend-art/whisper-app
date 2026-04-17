import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@whisper/shared'
import { AVATAR_COLORS } from '@whisper/shared'
import {
  loginWithPassword,
  signOutUser,
  getUserProfile,
  updateUserProfile,
} from '../queries/auth'
import type { SignUpResult } from '../queries/auth'
import { uploadImage } from '../queries/storage'

export function useAuth(client: SupabaseClient) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let presenceChannel: ReturnType<SupabaseClient['channel']> | null = null

    function startPresence(id: string, username: string) {
      presenceChannel = client.channel('online-users')
      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel!.track({ user_id: id, username })
          await client.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', id)
        }
      })
    }

    function stopPresence() {
      if (presenceChannel) {
        presenceChannel.untrack()
        client.removeChannel(presenceChannel)
        presenceChannel = null
      }
    }

    async function loadProfile(id: string, email: string) {
      await client.from('profiles').update({ email }).eq('id', id)
      const profile = await getUserProfile(client, id, email)
      if (!profile) return
      const pendingLang = typeof localStorage !== 'undefined' ? localStorage.getItem(`pending_lang_${id}`) : null
      if (pendingLang) {
        localStorage.removeItem(`pending_lang_${id}`)
        await client.from('profiles').update({ language: pendingLang }).eq('id', id)
        profile.language = pendingLang
      }
      setUser(profile)
      startPresence(id, profile.username)
    }

    client.auth.getSession().then(({ data }) => {
      const su = data.session?.user
      if (su) loadProfile(su.id, su.email!)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); stopPresence(); return }
      loadProfile(session.user.id, session.user.email!)
    })

    return () => { subscription.unsubscribe(); stopPresence() }
  }, [client])

  async function login(email: string, password: string): Promise<boolean> {
    return loginWithPassword(client, email, password)
  }

  async function signup(email: string, username: string, password: string, language: string = 'sr'): Promise<SignUpResult> {
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { data: { username, color } },
    })
    if (error) return { status: 'error', message: error.message }
    if (!data.user) return { status: 'error', message: 'Registracija nije uspela.' }
    await client.from('profiles').upsert({ id: data.user.id, username, color, is_admin: false, email, language })
    if (!data.session) {
      if (typeof localStorage !== 'undefined') localStorage.setItem(`pending_lang_${data.user.id}`, language)
      return { status: 'confirm_email' }
    }
    const profile = await getUserProfile(client, data.user.id, email)
    if (profile) setUser(profile)
    return { status: 'ok' }
  }

  async function logout(): Promise<void> {
    await signOutUser(client)
    setUser(null)
  }

  async function updateProfile(username: string, avatarImage?: string | null, language?: string): Promise<void> {
    if (!user) return
    let avatarUrl: string | null = null
    if (avatarImage === undefined) {
      avatarUrl = user.avatarUrl ?? null
    } else if (avatarImage && avatarImage.startsWith('data:')) {
      avatarUrl = await uploadImage(client, 'avatars', avatarImage, user.id)
    }
    await updateUserProfile(client, user.id, username, avatarUrl, language)
    setUser(prev => prev ? { ...prev, username, avatarUrl, ...(language ? { language } : {}) } : prev)
  }

  return { user, setUser, login, signup, logout, updateProfile }
}
