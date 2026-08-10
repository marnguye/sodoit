import "server-only";

import { createClient } from "@supabase/supabase-js";

class UnusedWebSocket {
  constructor() {
    throw new Error("Realtime is not used by the Supabase admin client.");
  }
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing server-only Supabase admin environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    realtime: {
      transport: UnusedWebSocket as unknown as typeof WebSocket,
    },
  });
}
