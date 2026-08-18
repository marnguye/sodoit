import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, applyMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  applyMock: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin: requireAdminMock,
}));
vi.mock("@/lib/admin/guides/apply", () => ({
  applyGuideImport: applyMock,
}));

import { POST as applyRoute } from "@/app/admin/imports/guides/apply/route";
import { buildGuidesWorkbook, workbookToBlob } from "@/lib/admin/guides/excel";

async function xlsxFile(name = "upload.xlsx"): Promise<File> {
  const workbook = buildGuidesWorkbook([], []);
  const blob = await workbookToBlob(workbook);
  return new File([blob], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function requestWithFile(
  file: File | null,
  guideFingerprints?: string,
  itemFingerprints?: string,
): Request {
  const formData = new FormData();
  if (file) formData.set("file", file);
  if (guideFingerprints !== undefined)
    formData.set("guideFingerprints", guideFingerprints);
  if (itemFingerprints !== undefined)
    formData.set("itemFingerprints", itemFingerprints);
  return new Request("http://localhost/admin/imports/guides/apply", {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  applyMock.mockResolvedValue({
    ok: true,
    guides: { created: [], updated: [] },
    items: { created: [], updated: [] },
  });
});

describe("guides import apply route — authorization", () => {
  it("denies an anonymous request", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "You must be signed in.",
    });

    const response = await applyRoute(requestWithFile(await xlsxFile()));

    expect(response.status).toBe(401);
    expect(applyMock).not.toHaveBeenCalled();
  });

  it("denies an authenticated non-admin", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "Admin access required.",
    });

    const response = await applyRoute(requestWithFile(await xlsxFile()));

    expect(response.status).toBe(403);
    expect(applyMock).not.toHaveBeenCalled();
  });

  it("allows an admin through to the apply layer", async () => {
    requireAdminMock.mockResolvedValue({ ok: true, userId: "admin-1" });

    const response = await applyRoute(requestWithFile(await xlsxFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(applyMock).toHaveBeenCalledOnce();
  });
});

describe("guides import apply route — response mapping", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue({ ok: true, userId: "admin-1" });
  });

  it("rejects an upload with no file before calling apply", async () => {
    const response = await applyRoute(requestWithFile(null));
    expect(response.status).toBe(400);
    expect(applyMock).not.toHaveBeenCalled();
  });

  it("returns 409 for a stale_preview result", async () => {
    applyMock.mockResolvedValue({
      ok: false,
      kind: "stale_preview",
      conflicts: [
        { entity: "guide", id: "x", title: "Row", reason: "changed" },
      ],
    });

    const response = await applyRoute(requestWithFile(await xlsxFile()));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.kind).toBe("stale_preview");
    expect(body.conflicts).toHaveLength(1);
  });

  it("returns 400 for a validation_error result", async () => {
    applyMock.mockResolvedValue({
      ok: false,
      kind: "validation_error",
      preview: {
        guides: [],
        items: [],
        summary: {
          guides: { total: 0, create: 0, update: 0, unchanged: 0, error: 1 },
          items: { total: 0, create: 0, update: 0, unchanged: 0, error: 0 },
        },
      },
    });

    const response = await applyRoute(requestWithFile(await xlsxFile()));
    expect(response.status).toBe(400);
  });

  it("returns 500 for an apply_failed result without leaking internals", async () => {
    applyMock.mockResolvedValue({
      ok: false,
      kind: "apply_failed",
      error: "Could not apply the import. No changes were made.",
    });

    const response = await applyRoute(requestWithFile(await xlsxFile()));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).not.toMatch(/postgres|stack|at Object/i);
  });

  it("parses both fingerprint fields and forwards them to applyGuideImport", async () => {
    await applyRoute(
      requestWithFile(
        await xlsxFile(),
        JSON.stringify({ "guide-1": "abc" }),
        JSON.stringify({ "item-1": "def" }),
      ),
    );

    expect(applyMock).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      { "guide-1": "abc" },
      { "item-1": "def" },
    );
  });

  it("ignores malformed fingerprints safely rather than crashing", async () => {
    const response = await applyRoute(
      requestWithFile(await xlsxFile(), "{not json"),
    );
    expect(response.status).toBe(400);
    expect(applyMock).not.toHaveBeenCalled();
  });
});
