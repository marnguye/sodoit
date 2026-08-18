import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildGuidesWorkbook,
  workbookToBlob,
  type GuideExcelRow,
  type GuideItemExcelRow,
} from "@/lib/admin/guides/excel";
import {
  fingerprintGuide,
  fingerprintGuideItem,
} from "@/lib/admin/guides/import";
import type { Guide, GuideItem } from "@/lib/guides/types";

const { listExportMock, rpcMock } = vi.hoisted(() => ({
  listExportMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("@/lib/admin/guides/queries", () => ({
  listGuidesForExport: listExportMock,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: rpcMock }),
}));

import { applyGuideImport } from "@/lib/admin/guides/apply";

function guideRow(overrides: Partial<GuideExcelRow> = {}): GuideExcelRow {
  return {
    id: "",
    import_ref: "",
    title: "48 Hours in Prague",
    slug: "48-hours-in-prague",
    description: "A weekend in Prague.",
    type: "itinerary",
    city: "Prague",
    country_code: "CZ",
    city_slug: "",
    cover_image_url: "",
    cover_image_alt: "",
    duration_label: "",
    featured: false,
    is_public: true,
    sort_order: 0,
    editorial_attribution: "",
    ...overrides,
  };
}

function itemRow(
  overrides: Partial<GuideItemExcelRow> = {},
): GuideItemExcelRow {
  return {
    id: "",
    guide_id: "",
    guide_ref: "",
    position: 0,
    title: "Explore the National Museum",
    description: "",
    place_id: "",
    place_name: "",
    image_url: "",
    image_alt: "",
    external_url: "",
    ...overrides,
  };
}

function existingGuide(overrides: Partial<Guide> = {}): Guide {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "48-hours-in-prague",
    title: "48 Hours in Prague",
    description: "A weekend in Prague.",
    city: "Prague",
    country_code: "CZ",
    cover_image_url: null,
    cover_image_alt: null,
    duration_label: null,
    is_public: true,
    featured: false,
    type: "itinerary",
    city_slug: null,
    sort_order: 0,
    editorial_attribution: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function existingItem(overrides: Partial<GuideItem> = {}): GuideItem {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    guide_id: "11111111-1111-4111-8111-111111111111",
    position: 0,
    title: "Explore the National Museum",
    description: null,
    place_name: null,
    image_url: null,
    image_alt: null,
    external_url: null,
    place_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

async function bufferFromSheets(
  guides: GuideExcelRow[],
  items: GuideItemExcelRow[],
): Promise<ArrayBuffer> {
  const workbook = buildGuidesWorkbook(guides, items);
  const blob = await workbookToBlob(workbook);
  return blob.arrayBuffer();
}

beforeEach(() => {
  vi.clearAllMocks();
  rpcMock.mockResolvedValue({
    data: {
      created_guide_ids: [],
      updated_guides: 0,
      created_item_ids: [],
      updated_items: 0,
    },
    error: null,
  });
});

describe("applyGuideImport — revalidation blocks apply with zero writes", () => {
  it("blocks on an invalid Guide", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ type: "not-a-real-type" })],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("validation_error");
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on an invalid Guide Item", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ guide_id: guide.id, title: "" })],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on an unknown Guide id", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: "99999999-9999-4999-8999-999999999999" })],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on an unknown Guide Item id", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ id: "99999999-9999-4999-8999-999999999999" })],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on duplicate Guide ids", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [
        guideRow({ id: guide.id, slug: "a" }),
        guideRow({ id: guide.id, slug: "b", title: "Second" }),
      ],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on duplicate Guide Item ids", async () => {
    const guide = existingGuide();
    const item = existingItem();
    listExportMock.mockResolvedValue({ guides: [guide], items: [item] });
    const buffer = await bufferFromSheets(
      [],
      [
        itemRow({ id: item.id, guide_id: guide.id, position: 0 }),
        itemRow({
          id: item.id,
          guide_id: guide.id,
          position: 1,
          title: "Second",
        }),
      ],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on a duplicate Guide slug in the workbook", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [
        guideRow({ slug: "shared", title: "First" }),
        guideRow({ slug: "shared", title: "Second" }),
      ],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on a duplicate import_ref", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [
        guideRow({ import_ref: "dup", slug: "a" }),
        guideRow({ import_ref: "dup", slug: "b", title: "Second" }),
      ],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on an unknown guide_ref", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets([], [itemRow({ guide_ref: "nope" })]);
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on duplicate positions within the same guide", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [],
      [
        itemRow({ guide_id: guide.id, position: 1, title: "First" }),
        itemRow({ guide_id: guide.id, position: 1, title: "Second" }),
      ],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks on an attempt to reparent an existing Guide Item", async () => {
    const originalParent = existingGuide();
    const otherParent = existingGuide({
      id: "44444444-4444-4444-8444-444444444444",
      slug: "other-guide",
    });
    const item = existingItem({ guide_id: originalParent.id });
    listExportMock.mockResolvedValue({
      guides: [originalParent, otherParent],
      items: [item],
    });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ id: item.id, guide_id: otherParent.id, position: 0 })],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

describe("applyGuideImport — concurrency", () => {
  it("allows apply when the Guide fingerprint is unchanged", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      {},
    );
    expect(result.ok).toBe(true);
    expect(rpcMock).toHaveBeenCalledOnce();
  });

  it("rejects apply when the Guide fingerprint changed since preview", async () => {
    const guide = existingGuide();
    const staleFingerprint = fingerprintGuide(
      existingGuide({ featured: false }),
    );
    listExportMock.mockResolvedValue({
      guides: [existingGuide({ featured: true })],
      items: [],
    });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, sort_order: 5 })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: staleFingerprint },
      {},
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("stale_preview");
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("allows apply when the Guide Item fingerprint is unchanged", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id });
    listExportMock.mockResolvedValue({ guides: [guide], items: [item] });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ id: item.id, guide_id: guide.id, title: "New title" })],
    );
    const result = await applyGuideImport(
      buffer,
      {},
      { [item.id]: fingerprintGuideItem(item) },
    );
    expect(result.ok).toBe(true);
    expect(rpcMock).toHaveBeenCalledOnce();
  });

  it("rejects apply when the Guide Item fingerprint changed since preview", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id });
    const staleFingerprint = fingerprintGuideItem(
      existingItem({ guide_id: guide.id, title: "Old title" }),
    );
    listExportMock.mockResolvedValue({
      guides: [guide],
      items: [existingItem({ guide_id: guide.id, title: "Changed elsewhere" })],
    });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ id: item.id, guide_id: guide.id, title: "New title" })],
    );
    const result = await applyGuideImport(
      buffer,
      {},
      { [item.id]: staleFingerprint },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("stale_preview");
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("treats a Guide deleted since preview as zero writes", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      {},
    );
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("treats a Guide Item deleted since preview as zero writes", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id });
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ id: item.id, guide_id: guide.id, title: "New title" })],
    );
    const result = await applyGuideImport(
      buffer,
      {},
      { [item.id]: fingerprintGuideItem(item) },
    );
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("treats a slug that became occupied since preview as zero writes", async () => {
    const target = existingGuide();
    const other = existingGuide({
      id: "55555555-5555-4555-8555-555555555555",
      slug: "taken-since-preview",
    });
    listExportMock.mockResolvedValue({ guides: [target, other], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: target.id, slug: "taken-since-preview" })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [target.id]: fingerprintGuide(target) },
      {},
    );
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("blocks the entire workbook when any single entity is stale", async () => {
    const guideOk = existingGuide();
    const guideStale = existingGuide({
      id: "66666666-6666-4666-8666-666666666666",
      slug: "second-guide",
    });
    listExportMock.mockResolvedValue({
      guides: [guideOk, existingGuide({ ...guideStale, featured: true })],
      items: [],
    });
    const buffer = await bufferFromSheets(
      [
        guideRow({ id: guideOk.id, sort_order: 1 }),
        guideRow({ id: guideStale.id, slug: "second-guide", sort_order: 2 }),
      ],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      {
        [guideOk.id]: fingerprintGuide(guideOk),
        [guideStale.id]: fingerprintGuide(guideStale),
      },
      {},
    );
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

describe("applyGuideImport — apply semantics", () => {
  it("succeeds for a create-only Guide import", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    rpcMock.mockResolvedValue({
      data: {
        created_guide_ids: ["new-guide-1"],
        updated_guides: 0,
        created_item_ids: [],
        updated_items: 0,
      },
      error: null,
    });
    const buffer = await bufferFromSheets(
      [guideRow({ slug: "brand-new" })],
      [],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.guides.created).toEqual([
        { id: "new-guide-1", title: "48 Hours in Prague" },
      ]);
    }
  });

  it("succeeds for an update-only Guide import", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      {},
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.guides.updated).toEqual([
        { id: guide.id, title: guide.title },
      ]);
    }
  });

  it("succeeds creating a Guide Item against an existing Guide", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    rpcMock.mockResolvedValue({
      data: {
        created_guide_ids: [],
        updated_guides: 0,
        created_item_ids: ["new-item-1"],
        updated_items: 0,
      },
      error: null,
    });
    const buffer = await bufferFromSheets(
      [],
      [itemRow({ guide_id: guide.id, position: 9 })],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.items.created).toHaveLength(1);

    const payload = rpcMock.mock.calls[0][1];
    expect(payload.item_creates[0].guide_id).toBe(guide.id);
    expect(payload.item_creates[0].guide_ref).toBeNull();
  });

  it("succeeds creating a new Guide with new Items through guide_ref", async () => {
    listExportMock.mockResolvedValue({ guides: [], items: [] });
    rpcMock.mockResolvedValue({
      data: {
        created_guide_ids: ["new-guide-2"],
        updated_guides: 0,
        created_item_ids: ["new-item-a", "new-item-b"],
        updated_items: 0,
      },
      error: null,
    });
    const buffer = await bufferFromSheets(
      [guideRow({ import_ref: "prague-nightlife", slug: "prague-nightlife" })],
      [
        itemRow({ guide_ref: "prague-nightlife", position: 0, title: "Bar" }),
        itemRow({
          guide_ref: "prague-nightlife",
          position: 1,
          title: "Dinner",
        }),
      ],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.guides.created).toEqual([
        { id: "new-guide-2", title: "48 Hours in Prague" },
      ]);
      expect(result.items.created).toHaveLength(2);
    }

    const payload = rpcMock.mock.calls[0][1];
    expect(payload.guide_creates[0].import_ref).toBe("prague-nightlife");
    expect(payload.item_creates[0].guide_ref).toBe("prague-nightlife");
    expect(payload.item_creates[0].guide_id).toBeNull();
  });

  it("succeeds for a mixed create/update Guides + Items import", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id });
    listExportMock.mockResolvedValue({ guides: [guide], items: [item] });
    rpcMock.mockResolvedValue({
      data: {
        created_guide_ids: ["new-guide-3"],
        updated_guides: 1,
        created_item_ids: ["new-item-c"],
        updated_items: 1,
      },
      error: null,
    });
    const buffer = await bufferFromSheets(
      [
        guideRow({ id: guide.id, featured: true }),
        guideRow({ import_ref: "ref-mixed", slug: "mixed-new-guide" }),
      ],
      [
        itemRow({ id: item.id, guide_id: guide.id, title: "Updated title" }),
        itemRow({ guide_ref: "ref-mixed", position: 0, title: "Fresh item" }),
      ],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      { [item.id]: fingerprintGuideItem(item) },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.guides.created).toHaveLength(1);
      expect(result.guides.updated).toHaveLength(1);
      expect(result.items.created).toHaveLength(1);
      expect(result.items.updated).toHaveLength(1);
    }
  });

  it("excludes unchanged entities from the RPC payload", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id });
    listExportMock.mockResolvedValue({ guides: [guide], items: [item] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id })],
      [itemRow({ id: item.id, guide_id: guide.id })],
    );
    const result = await applyGuideImport(buffer, {}, {});
    expect(result.ok).toBe(true);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("leaves rows absent from the workbook untouched (not sent to the RPC)", async () => {
    const guide = existingGuide();
    const untouchedGuide = existingGuide({
      id: "77777777-7777-4777-8777-777777777777",
      slug: "untouched",
    });
    listExportMock.mockResolvedValue({
      guides: [guide, untouchedGuide],
      items: [],
    });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [],
    );
    await applyGuideImport(buffer, { [guide.id]: fingerprintGuide(guide) }, {});

    const payload = rpcMock.mock.calls[0][1];
    const updatedIds = payload.guide_updates.map((g: { id: string }) => g.id);
    expect(updatedIds).toEqual([guide.id]);
    expect(updatedIds).not.toContain(untouchedGuide.id);
  });

  it("never sends import_ref/guide_ref as persisted domain fields on updates", async () => {
    const guide = existingGuide();
    const item = existingItem({ guide_id: guide.id, title: "Old" });
    listExportMock.mockResolvedValue({ guides: [guide], items: [item] });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [itemRow({ id: item.id, guide_id: guide.id, title: "New" })],
    );
    await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      { [item.id]: fingerprintGuideItem(item) },
    );

    const payload = rpcMock.mock.calls[0][1];
    expect(payload.guide_updates[0]).not.toHaveProperty("import_ref");
    expect(payload.item_updates[0]).not.toHaveProperty("guide_ref");
    expect(payload.item_updates[0]).not.toHaveProperty("guide_id");
  });
});

describe("applyGuideImport — atomicity boundary", () => {
  it("performs exactly one RPC call for a mixed import", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    const buffer = await bufferFromSheets(
      [
        guideRow({ id: guide.id, featured: true }),
        guideRow({ slug: "another-new", title: "Another" }),
      ],
      [],
    );
    await applyGuideImport(buffer, { [guide.id]: fingerprintGuide(guide) }, {});

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith(
      "apply_guide_import",
      expect.objectContaining({
        guide_creates: expect.any(Array),
        guide_updates: expect.any(Array),
        item_creates: expect.any(Array),
        item_updates: expect.any(Array),
      }),
    );
  });

  it("reports apply_failed when the RPC fails, with no other calls made", async () => {
    const guide = existingGuide();
    listExportMock.mockResolvedValue({ guides: [guide], items: [] });
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "simulated failure mid-transaction" },
    });
    const buffer = await bufferFromSheets(
      [guideRow({ id: guide.id, featured: true })],
      [],
    );
    const result = await applyGuideImport(
      buffer,
      { [guide.id]: fingerprintGuide(guide) },
      {},
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("apply_failed");
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });
});
