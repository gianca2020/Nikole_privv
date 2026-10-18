import { supabase } from './supabase'

export async function uploadToSiteAssets(file, folder) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  const ext = file.name.split('.').pop()
  const filename = `${timestamp}-${random}.${ext}`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from('site-assets')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Get the public URL
  const { data: publicUrl } = supabase.storage
    .from('site-assets')
    .getPublicUrl(path)

  return {
    url: publicUrl.publicUrl,
    path: path,
  }
}

export async function deleteFromSiteAssets(url) {
  // Extract path from URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/site-assets/folder/file.ext
  const pathMatch = url.match(/site-assets\/(.+)$/)
  if (!pathMatch) {
    console.warn('Could not extract path from URL:', url)
    return
  }

  const path = pathMatch[1]

  const { error } = await supabase.storage
    .from('site-assets')
    .remove([path])

  if (error) {
    console.warn('Failed to delete file:', error)
    // Don't throw - this is best effort
  }
}
