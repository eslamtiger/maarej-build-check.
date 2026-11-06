import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// One client for the whole app. Same project (and so the same database) as the student site.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
export const hasBackend = Boolean(supabase);
