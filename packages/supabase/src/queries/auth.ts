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

export type SignUpResult =
  | { status: 'ok' }
  | { status: 'confirm_email' }
  | { status: 'error'; message: string }

export async function signUpUser(
  client: SupabaseClient,
  email: string,
  username: string,
  password: string,
  language: string = 'sr'
): Promise<SignUpResult> {
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username, color } },
  })
  if (error) return { status: 'error', message: error.message }
  if (!data.user) return { status: 'error', message: 'Registracija nije uspela.' }
  if (!data.session) return { status: 'confirm_email' }
  await client.from('profiles').upsert({ id: data.user.id, username, color, is_admin: false, language })
  return { status: 'ok' }
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
    language: profile.language ?? 'sr',
  }
}

export async function updateUserProfile(
  client: SupabaseClient,
  userId: string,
  username: string,
  avatarUrl: string | null,
  language?: string
): Promise<void> {
  const updates: Record<string, unknown> = { username, avatar_url: avatarUrl }
  if (language) updates.language = language
  await client.from('profiles').update(updates).eq('id', userId)
}
