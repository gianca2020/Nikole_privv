import { supabase } from './supabase'

export async function listCreatives() {
  const { data, error } = await supabase
    .from('creatives')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCreative(id) {
  const { data, error } = await supabase
    .from('creatives')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCreative(creative) {
  const { data, error } = await supabase
    .from('creatives')
    .insert([creative])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCreative(id, updates) {
  const { data, error } = await supabase
    .from('creatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCreative(id) {
  const { error } = await supabase
    .from('creatives')
    .delete()
    .eq('id', id)

  if (error) throw error
}
