import "server-only";

import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";

class UnusedWebSocket {
  constructor() {
    throw new Error("Realtime is not used by the Supabase admin client.");
  }
}

export function createAdminClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
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
