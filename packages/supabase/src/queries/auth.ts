import type { SupabaseClient } from '@supabase/supabase-js'
import { AVATAR_COLORS } from '@whisper/shared'
import type { User } from '@whisper/shared'

export async function loginWithPassword(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<boolean> {
  const { error } = await client.auth.signInWithPassword({ email, password })
  return !error
}

export async function signUpUser(
  client: SupabaseClient,
  email: string,
  username: string,
  password: string
): Promise<boolean> {
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username, color } },
  })
  if (error || !data.user) return false
  await client.from('profiles').upsert({ id: data.user.id, username, color, is_admin: false })
  return true
}

export async function signOutUser(client: SupabaseClient): Promise<void> {
  await client.auth.signOut()
}

export async function getUserProfile(
  client: SupabaseClient,
  userId: string,
  email: string
): Promise<User | null> {
  const { data: profile } = await client.from('profiles').select('*').eq('id', userId).single()
  if (!profile) return null
  return {
    id: userId,
    email,
    username: profile.username ?? email,
    color: profile.color ?? '#FF9500',
    avatarUrl: profile.avatar_url,
    isAdmin: profile.is_admin,
  }
}

export async function updateUserProfile(
  client: SupabaseClient,
  userId: string,
  username: string,
  avatarUrl: string | null
): Promise<void> {
  await client.from('profiles').update({ username, avatar_url: avatarUrl }).eq('id', userId)
}
