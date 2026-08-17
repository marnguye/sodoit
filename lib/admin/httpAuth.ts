import "server-only";
import { requireAdmin, type RequireAdminResult } from "./requireAdmin";

export async function requireAdminForRequest(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const result: RequireAdminResult = await requireAdmin();

  if (result.ok) return result;

  const status = result.error === "You must be signed in." ? 401 : 403;

  return {
    ok: false,
    response: Response.json({ error: result.error }, { status }),
  };
}
