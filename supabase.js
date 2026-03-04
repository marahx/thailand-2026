import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ─── Storage helpers (replaces window.storage) ─── */

export async function loadData(key, fallback) {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return fallback;
    return JSON.parse(data.value);
  } catch {
    return fallback;
  }
}

export async function saveData(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    const { error } = await supabase
      .from('app_data')
      .upsert(
        { key, value: jsonValue, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) console.error('Save error:', error);
  } catch (err) {
    console.error('Save error:', err);
  }
}
