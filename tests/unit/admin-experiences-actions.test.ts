import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, isSlugTakenMock, fromMock, insertMock, updateMock } =
  vi.hoisted(() => ({
    requireAdminMock: vi.fn(),
    isSlugTakenMock: vi.fn(),
    fromMock: vi.fn(),
    insertMock: vi.fn(),
    updateMock: vi.fn(),
  }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin: requireAdminMock,
}));
vi.mock("@/lib/admin/experiences/queries", () => ({
  isExperienceSlugTaken: isSlugTakenMock,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: fromMock }),
}));

import {
  createExperience,
  setExperienceVisibility,
  updateExperience,
} from "@/lib/admin/experiences/actions";

function validFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("title", "Watch a sunrise");
  formData.set("slug", "watch-a-sunrise");
  formData.set("description", "");
  formData.set("category", "Nature");
  formData.set("difficulty", "Easy");
  formData.set("location_type", "global");
  formData.set("country_code", "");
  formData.set("city", "");
  formData.set("image_url", "");
  formData.set("image_alt", "");
  for (const [key, value] of Object.entries(overrides))
    formData.set(key, value);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdminMock.mockResolvedValue({ ok: true, userId: "admin-1" });
  isSlugTakenMock.mockResolvedValue(false);
  insertMock.mockReturnValue({
    select: () => ({
      single: () => Promise.resolve({ data: { id: "new-id" }, error: null }),
    }),
  });
  updateMock.mockReturnValue({
    eq: () => Promise.resolve({ error: null }),
  });
  fromMock.mockReturnValue({ insert: insertMock, update: updateMock });
});

describe("createExperience authorization", () => {
  it("refuses to create when the caller is not an admin", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "Admin access required.",
    });

    const result = await createExperience(validFormData());

    expect(result).toEqual({ success: false, error: "Admin access required." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("creates when the caller is an admin", async () => {
    const result = await createExperience(validFormData());

    expect(result).toEqual({ success: true, id: "new-id" });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Watch a sunrise",
        slug: "watch-a-sunrise",
      }),
    );
  });
});

describe("createExperience validation", () => {
  it("rejects a missing title", async () => {
    const result = await createExperience(validFormData({ title: "" }));
    expect(result.success).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid category", async () => {
    const result = await createExperience(
      validFormData({ category: "Not a real category" }),
    );
    expect(result.success).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects a duplicate slug before touching the database", async () => {
    isSlugTakenMock.mockResolvedValue(true);

    const result = await createExperience(validFormData());

    expect(result).toEqual({
      success: false,
      error: "That slug is already in use.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("surfaces a unique-violation from the database as a slug error", async () => {
    insertMock.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: { code: "23505", message: "duplicate key" },
          }),
      }),
    });

    const result = await createExperience(validFormData());

    expect(result).toEqual({
      success: false,
      error: "That slug is already in use.",
    });
  });
});

describe("updateExperience", () => {
  it("rejects a malformed id without calling the database", async () => {
    const result = await updateExperience("not-a-uuid", validFormData());
    expect(result.success).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
    expect(requireAdminMock).not.toHaveBeenCalled();
  });

  it("updates when the id and payload are valid", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const result = await updateExperience(id, validFormData());

    expect(result).toEqual({ success: true, id });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Watch a sunrise" }),
    );
  });
});

describe("setExperienceVisibility", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("blocks non-admins from publishing or hiding", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "Admin access required.",
    });

    const result = await setExperienceVisibility(id, true);

    expect(result.success).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("toggles is_public for an admin", async () => {
    const result = await setExperienceVisibility(id, true);

    expect(result).toEqual({ success: true, id });
    expect(updateMock).toHaveBeenCalledWith({ is_public: true });
  });
});
