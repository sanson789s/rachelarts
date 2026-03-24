import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client.
// These environment variables will need to be provided in the Netlify site settings
// or in a local `.env.local` file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
