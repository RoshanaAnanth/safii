import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase: ReturnType<typeof createClient>;

if (!(window as any).__supabase) {
  (window as any).__supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: localStorage, // Use sessionStorage
      autoRefreshToken: true,
      persistSession: true, // Required for sessionStorage to work
    },
  });
}
supabase = (window as any).__supabase;

export default supabase;
