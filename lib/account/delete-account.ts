import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteAccountData(
  admin: SupabaseClient,
  userId: string,
) {
  const avatarPaths: string[] = [];
  let offset = 0;

  while (true) {
    const avatars = await admin.storage.from("avatars").list(userId, {
      limit: 100,
      offset,
    });

    if (avatars.error) {
      throw new Error("Could not list account avatar objects.");
    }

    avatarPaths.push(
      ...(avatars.data ?? []).map((avatar) => `${userId}/${avatar.name}`),
    );

    if (!avatars.data || avatars.data.length < 100) break;
    offset += avatars.data.length;
  }

  if (avatarPaths.length) {
    const removed = await admin.storage.from("avatars").remove(avatarPaths);

    if (removed.error) {
      throw new Error("Could not remove account avatar objects.");
    }
  }

  const deleted = await admin.auth.admin.deleteUser(userId);

  if (deleted.error) {
    throw new Error("Could not delete account.");
  }
}
