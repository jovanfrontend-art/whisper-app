import type { SupabaseClient } from '@supabase/supabase-js'

export async function uploadImage(
  client: SupabaseClient,
  folder: 'posts' | 'comments' | 'avatars',
  base64DataUrl: string,
  userId?: string
): Promise<string | null> {
  const base64 = base64DataUrl.split(',')[1]
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'image/jpeg' })
  const path = folder === 'avatars' && userId
    ? `avatars/${userId}.jpg`
    : `${folder}/${Date.now()}.jpg`

  const { data: upload } = await client.storage
    .from('whisper-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: folder === 'avatars' })

  if (!upload) return null
  const { data: { publicUrl } } = client.storage.from('whisper-images').getPublicUrl(path)
  return folder === 'avatars' ? `${publicUrl}?t=${Date.now()}` : publicUrl
}
