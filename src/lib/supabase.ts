// Supabase client for the MWFitnessUK website (shared database with the mobile app).
//
// Env (Vercel → Project Settings → Environment Variables, for BOTH Preview and
// Production): VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
//
// The publishable key is safe for the browser; Row Level Security protects data.
// The admin panel additionally requires the signed-in user's `profiles.role`
// to be `admin` or `coach`.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

/** False when the Vercel env vars haven't been set — site runs without the admin panel. */
export const isSupabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;