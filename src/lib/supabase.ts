import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vulhivjvdeevpkjcibte.supabase.co';
// Sanitize URL by removing /rest/v1/ suffix if present
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_h2CtmoZ1FwRdFvp1ZXdwnw_iQgA6pQK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
