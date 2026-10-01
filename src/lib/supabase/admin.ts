import { createClient } from "@supabase/supabase-js"

// Service-role client. Only for server code that has already checked who the caller is.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
