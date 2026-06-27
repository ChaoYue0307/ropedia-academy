import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional. When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set, Ropedia
// Academy enables Google / magic-link login and cross-device sync. When unset,
// the app runs fully in local-only mode (progress lives in this browser).

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string)
  : null;
