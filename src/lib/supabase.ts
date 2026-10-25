import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function supabaseConfigurationError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes('YOUR-PROJECT') || anonKey.includes('YOUR-')) {
    return 'Login is unavailable because Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the app.';
  }
  return null;
}

export function isMissingAuthSession(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const authError = error as { name?: unknown; message?: unknown };
  return authError.name === 'AuthSessionMissingError' || authError.message === 'Auth session missing!';
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configurationError = supabaseConfigurationError();
  if (configurationError || !url || !anonKey) throw new Error(configurationError || 'Supabase is not configured.');

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
