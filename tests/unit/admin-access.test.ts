import { describe, expect, it } from "vitest";
import { getAdminAccess } from "../../lib/admin/access";

function mockSupabase({
  user,
  role,
}: {
  user: { id: string } | null;
  role?: string | null;
}) {
  return {
    auth: {
      async getUser() {
        return { data: { user } };
      },
    },
    from() {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        async maybeSingle() {
          return { data: role === undefined ? null : { role } };
        },
      };
    },
  } as never;
}

describe("getAdminAccess", () => {
  it("denies anonymous users", async () => {
    const access = await getAdminAccess(mockSupabase({ user: null }));
    expect(access.status).toBe("unauthenticated");
  });

  it("denies authenticated non-admin users", async () => {
    const access = await getAdminAccess(
      mockSupabase({ user: { id: "user-1" }, role: "user" }),
    );
    expect(access.status).toBe("forbidden");
  });

  it("denies users with no profile row", async () => {
    const access = await getAdminAccess(
      mockSupabase({ user: { id: "user-1" } }),
    );
    expect(access.status).toBe("forbidden");
  });

  it("allows admin users", async () => {
    const access = await getAdminAccess(
      mockSupabase({ user: { id: "admin-1" }, role: "admin" }),
    );
    expect(access).toEqual({ status: "ok", userId: "admin-1" });
  });
});
