import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, listExportMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  listExportMock: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin: requireAdminMock,
}));
vi.mock("@/lib/admin/experiences/queries", () => ({
  listExperiencesForExport: listExportMock,
}));

import { POST as previewRoute } from "@/app/admin/imports/experiences/preview/route";
import {
  buildExperiencesWorkbook,
  workbookToBlob,
} from "@/lib/admin/experiences/excel";

async function xlsxFile(name = "upload.xlsx"): Promise<File> {
  const workbook = buildExperiencesWorkbook([]);
  const blob = await workbookToBlob(workbook);
  return new File([blob], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function requestWithFile(file: File | Blob | null, fieldName = "file") {
  const formData = new FormData();
  if (file)
    formData.set(fieldName, file, file instanceof File ? file.name : undefined);
  return new Request("http://localhost/admin/imports/experiences/preview", {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  listExportMock.mockResolvedValue([]);
});

describe("experiences import preview route — authorization", () => {
  it("denies an anonymous request", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "You must be signed in.",
    });

    const response = await previewRoute(requestWithFile(await xlsxFile()));

    expect(response.status).toBe(401);
    expect(listExportMock).not.toHaveBeenCalled();
  });

  it("denies an authenticated non-admin", async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      error: "Admin access required.",
    });

    const response = await previewRoute(requestWithFile(await xlsxFile()));

    expect(response.status).toBe(403);
    expect(listExportMock).not.toHaveBeenCalled();
  });

  it("allows an admin and returns a preview", async () => {
    requireAdminMock.mockResolvedValue({ ok: true, userId: "admin-1" });

    const response = await previewRoute(requestWithFile(await xlsxFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.preview.summary.total).toBe(0);
    expect(listExportMock).toHaveBeenCalledOnce();
  });
});

describe("experiences import preview route — upload boundary", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue({ ok: true, userId: "admin-1" });
  });

  it("rejects a request with no file", async () => {
    const response = await previewRoute(requestWithFile(null));
    expect(response.status).toBe(400);
  });

  it("rejects a non-.xlsx filename", async () => {
    const file = await xlsxFile("upload.csv");
    const response = await previewRoute(requestWithFile(file));
    expect(response.status).toBe(400);
  });

  it("rejects an oversized file", async () => {
    const big = new Uint8Array(6 * 1024 * 1024);
    const file = new File([big], "big.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const response = await previewRoute(requestWithFile(file));
    expect(response.status).toBe(400);
  });

  it("rejects a file that is not a real xlsx despite the extension", async () => {
    const file = new File(["not a real workbook"], "fake.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const response = await previewRoute(requestWithFile(file));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/valid \.xlsx/);
  });
});
