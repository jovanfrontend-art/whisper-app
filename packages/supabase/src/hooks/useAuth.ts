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

    client.auth.getSession().then(({ data }) => {
      const su = data.session?.user
      if (su) {
        getUserProfile(client, su.id, su.email!).then(profile => {
          if (profile) { setUser(profile); startPresence(su.id, profile.username) }
        })
      }
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); stopPresence(); return }
      const su = session.user
      getUserProfile(client, su.id, su.email!).then(profile => {
        if (profile) { setUser(profile); startPresence(su.id, profile.username) }
      })
    })

    return () => { subscription.unsubscribe(); stopPresence() }
  }, [client])

  async function login(email: string, password: string): Promise<boolean> {
    return loginWithPassword(client, email, password)
  }

  async function signup(email: string, username: string, password: string): Promise<boolean> {
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { data: { username, color } },
    })
    if (error || !data.user) return false
    // Upsert profile BEFORE onAuthStateChange can fire getUserProfile
    await client.from('profiles').upsert({ id: data.user.id, username, color, is_admin: false, email })
    const profile = await getUserProfile(client, data.user.id, email)
    if (profile) setUser(profile)
    return true
  }

  async function logout(): Promise<void> {
    await signOutUser(client)
    setUser(null)
  }

  async function updateProfile(username: string, avatarImage?: string | null): Promise<void> {
    if (!user) return
    let avatarUrl = user.avatarUrl ?? null
    if (avatarImage && avatarImage.startsWith('data:')) {
      avatarUrl = await uploadImage(client, 'avatars', avatarImage, user.id)
    }
    await updateUserProfile(client, user.id, username, avatarUrl)
    setUser(prev => prev ? { ...prev, username, avatarUrl } : prev)
  }

  return { user, setUser, login, signup, logout, updateProfile }
}
