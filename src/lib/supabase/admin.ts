import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Server-only client with the service role key. It skips row level security, so it is used ONLY
// by shop code that checks everything itself (checkout, webhook, downloads). Never import it from a component.
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}