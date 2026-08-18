import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import {
  buildGuidesWorkbook,
  GUIDE_EXCEL_COLUMNS,
  GUIDE_ITEM_EXCEL_COLUMNS,
  GUIDE_ITEMS_SHEET_NAME,
  GUIDES_SHEET_NAME,
  workbookToBlob,
  type GuideExcelRow,
  type GuideItemExcelRow,
} from "@/lib/admin/guides/excel";
import {
  buildGuideImportPreview,
  parseGuidesWorkbook,
} from "@/lib/admin/guides/import";
import type { Guide, GuideItem } from "@/lib/guides/types";

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

async function bufferFromWorkbook(
  workbook: ExcelJS.Workbook,
): Promise<ArrayBuffer> {
  const blob = await workbookToBlob(workbook);
  return blob.arrayBuffer();
}

async function parseRows(guides: GuideExcelRow[], items: GuideItemExcelRow[]) {
  const buffer = await bufferFromSheets(guides, items);
  const result = await parseGuidesWorkbook(buffer);
  if (!result.ok) throw new Error(result.error);
  return result;
}

describe("parseGuidesWorkbook — contract", () => {
  it("parses a valid exported workbook successfully", async () => {
    const result = await parseRows([guideRow()], [itemRow()]);
    expect(result.guideRows).toHaveLength(1);
    expect(result.itemRows).toHaveLength(1);
  });

  it("requires both sheets to exist — missing Guides", async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet(GUIDE_ITEMS_SHEET_NAME);
    const buffer = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(buffer);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Guides/);
  });

  it("requires both sheets to exist — missing Guide Items", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(GUIDES_SHEET_NAME);
    sheet.addRow(GUIDE_EXCEL_COLUMNS.map((c) => c.header));
    const buffer = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(buffer);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Guide Items/);
  });

  it("rejects bad Guide headers", async () => {
    const workbook = new ExcelJS.Workbook();
    const guides = workbook.addWorksheet(GUIDES_SHEET_NAME);
    guides.addRow(["id", "name"]);
    const items = workbook.addWorksheet(GUIDE_ITEMS_SHEET_NAME);
    items.addRow(GUIDE_ITEM_EXCEL_COLUMNS.map((c) => c.header));
    const buffer = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(buffer);
    expect(result.ok).toBe(false);
  });

  it("rejects bad Guide Item headers", async () => {
    const workbook = new ExcelJS.Workbook();
    const guides = workbook.addWorksheet(GUIDES_SHEET_NAME);
    guides.addRow(GUIDE_EXCEL_COLUMNS.map((c) => c.header));
    const items = workbook.addWorksheet(GUIDE_ITEMS_SHEET_NAME);
    items.addRow(["id", "name"]);
    const buffer = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(buffer);
    expect(result.ok).toBe(false);
  });

  it("ignores fully blank rows on both sheets", async () => {
    const workbook = buildGuidesWorkbook([guideRow()], [itemRow()]);
    workbook.getWorksheet(GUIDES_SHEET_NAME)!.addRow({});
    workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.addRow({});
    const buffer = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(buffer);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.guideRows).toHaveLength(1);
    expect(result.itemRows).toHaveLength(1);
  });

  it("rejects a formula cell on the Guides sheet", async () => {
    const buffer = await bufferFromSheets([guideRow()], []);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.getWorksheet(GUIDES_SHEET_NAME)!.getRow(2).getCell(3).value = {
      formula: "A1",
      result: "x",
    };
    const rebuilt = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(rebuilt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.guideRows[0].kind).toBe("error");
  });

  it("rejects a formula cell on the Guide Items sheet", async () => {
    const buffer = await bufferFromSheets([guideRow()], [itemRow()]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.getRow(2).getCell(5).value =
      {
        formula: "A1",
        result: "x",
      };
    const rebuilt = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(rebuilt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.itemRows[0].kind).toBe("error");
  });

  it("parses booleans deterministically", async () => {
    const result = await parseRows(
      [guideRow({ featured: true, is_public: false })],
      [],
    );
    const [row] = result.guideRows;
    expect(row.kind).toBe("candidate");
    if (row.kind === "candidate") {
      expect(row.candidate.featured).toBe(true);
      expect(row.candidate.is_public).toBe(false);
    }
  });

  it("keeps position and sort_order numeric", async () => {
    const result = await parseRows(
      [guideRow({ sort_order: 4 })],
      [itemRow({ position: 2 })],
    );
    const [guide] = result.guideRows;
    const [item] = result.itemRows;
    expect(guide.kind).toBe("candidate");
    expect(item.kind).toBe("candidate");
    if (guide.kind === "candidate") expect(guide.candidate.sort_order).toBe(4);
    if (item.kind === "candidate") expect(item.candidate.position).toBe(2);
  });

  it("rejects a fractional position", async () => {
    const buffer = await bufferFromSheets([guideRow()], [itemRow()]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.getRow(2).getCell(4).value =
      1.5;
    const rebuilt = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(rebuilt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.itemRows[0].kind).toBe("error");
  });

  it("rejects a negative position", async () => {
    const buffer = await bufferFromSheets([guideRow()], [itemRow()]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.getRow(2).getCell(4).value =
      -1;
    const rebuilt = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(rebuilt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.itemRows[0].kind).toBe("error");
  });

  it("rejects a non-numeric position", async () => {
    const buffer = await bufferFromSheets([guideRow()], [itemRow()]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.getRow(2).getCell(4).value =
      "first";
    const rebuilt = await bufferFromWorkbook(workbook);

    const result = await parseGuidesWorkbook(rebuilt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.itemRows[0].kind).toBe("error");
  });
});

describe("buildGuideImportPreview — Guides classification", () => {
  it("classifies a blank-id valid row as create", async () => {
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ id: "", import_ref: "prague-nightlife", slug: "new-guide" })],
      [],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.guides.create).toBe(1);
  });

  it("classifies an existing id with changed values as update", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ id: existing.id, featured: true })],
      [],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.guides.update).toBe(1);
    const [row] = preview.guides;
    if (row.status === "update") {
      expect(row.changes.map((c) => c.field)).toContain("featured");
    }
  });

  it("classifies an existing id with equivalent values as unchanged", async () => {
    const existing = existingGuide({ city_slug: null, description: null });
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ id: existing.id, city_slug: "", description: "" })],
      [],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.guides.unchanged).toBe(1);
  });

  it("errors on an unknown non-empty id", async () => {
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ id: "99999999-9999-4999-8999-999999999999" })],
      [],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.guides.error).toBe(1);
  });

  it("errors on duplicate Guide ids", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [
        guideRow({ id: existing.id, slug: "a" }),
        guideRow({ id: existing.id, slug: "b", title: "Second" }),
      ],
      [],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.guides.error).toBe(2);
  });

  it("errors on duplicate import_ref", async () => {
    const { guideRows, itemRows } = await parseRows(
      [
        guideRow({ import_ref: "dup", slug: "a" }),
        guideRow({ import_ref: "dup", slug: "b", title: "Second" }),
      ],
      [],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.guides.error).toBe(2);
  });

  it("errors on duplicate Guide slugs in the workbook", async () => {
    const { guideRows, itemRows } = await parseRows(
      [
        guideRow({ slug: "shared", title: "First" }),
        guideRow({ slug: "shared", title: "Second" }),
      ],
      [],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.guides.error).toBe(2);
  });

  it("errors on a slug collision with an existing DB Guide", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ id: "", slug: existing.slug, title: "Different" })],
      [],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.guides.error).toBe(1);
  });
});

describe("buildGuideImportPreview — Guide Item relationship resolution", () => {
  it("resolves an existing guide_id for a new item", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ guide_id: existing.id, position: 5 })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.items.create).toBe(1);
    const [row] = preview.items;
    if (row.status === "create") {
      expect(row.parent).toEqual({ kind: "existing", guideId: existing.id });
    }
  });

  it("resolves guide_ref to a new Guide's import_ref", async () => {
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ import_ref: "prague-nightlife", slug: "prague-nightlife" })],
      [itemRow({ guide_ref: "prague-nightlife", position: 0 })],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.items.create).toBe(1);
    const [row] = preview.items;
    if (row.status === "create") {
      expect(row.parent).toEqual({
        kind: "new",
        importRef: "prague-nightlife",
      });
    }
  });

  it("errors on unknown guide_id", async () => {
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ guide_id: "99999999-9999-4999-8999-999999999999" })],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.items.error).toBe(1);
  });

  it("errors on unknown guide_ref", async () => {
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ guide_ref: "does-not-exist" })],
    );
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.items.error).toBe(1);
  });

  it("errors when both guide_id and guide_ref are populated", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ import_ref: "ref-1", slug: "ref-1-guide" })],
      [itemRow({ guide_id: existing.id, guide_ref: "ref-1" })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.items.error).toBe(1);
  });

  it("errors when neither guide_id nor guide_ref is populated", async () => {
    const { guideRows, itemRows } = await parseRows([], [itemRow()]);
    const preview = buildGuideImportPreview(guideRows, itemRows, [], []);
    expect(preview.summary.items.error).toBe(1);
  });

  it("errors on duplicate Guide Item ids", async () => {
    const existingParent = existingGuide();
    const existingA = existingItem({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    const { guideRows, itemRows } = await parseRows(
      [],
      [
        itemRow({ id: existingA.id, guide_id: existingParent.id, position: 0 }),
        itemRow({
          id: existingA.id,
          guide_id: existingParent.id,
          position: 1,
          title: "Second",
        }),
      ],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existingParent],
      [existingA],
    );
    expect(preview.summary.items.error).toBe(2);
  });

  it("errors on duplicate positions within the same resolved Guide", async () => {
    const existing = existingGuide();
    const { guideRows, itemRows } = await parseRows(
      [],
      [
        itemRow({ guide_id: existing.id, position: 1, title: "First" }),
        itemRow({ guide_id: existing.id, position: 1, title: "Second" }),
      ],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [existing],
      [],
    );
    expect(preview.summary.items.error).toBe(2);
  });

  it("allows the same position across two different resolved Guides", async () => {
    const guideA = existingGuide();
    const guideB = existingGuide({
      id: "33333333-3333-4333-8333-333333333333",
      slug: "guide-b",
    });
    const { guideRows, itemRows } = await parseRows(
      [],
      [
        itemRow({ guide_id: guideA.id, position: 0, title: "A item" }),
        itemRow({ guide_id: guideB.id, position: 0, title: "B item" }),
      ],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [guideA, guideB],
      [],
    );
    expect(preview.summary.items.error).toBe(0);
    expect(preview.summary.items.create).toBe(2);
  });

  it("rejects reparenting an existing Guide Item to a different guide", async () => {
    const originalParent = existingGuide();
    const otherParent = existingGuide({
      id: "44444444-4444-4444-8444-444444444444",
      slug: "other-guide",
    });
    const item = existingItem({ guide_id: originalParent.id });
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ id: item.id, guide_id: otherParent.id, position: 0 })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [originalParent, otherParent],
      [item],
    );
    expect(preview.summary.items.error).toBe(1);
    const [row] = preview.items;
    if (row.status === "error") {
      expect(row.errors.some((m) => m.includes("not supported"))).toBe(true);
    }
  });

  it("rejects guide_ref populated alongside an existing item id", async () => {
    const parent = existingGuide();
    const item = existingItem({ guide_id: parent.id });
    const { guideRows, itemRows } = await parseRows(
      [guideRow({ import_ref: "ref-x", slug: "ref-x-guide" })],
      [itemRow({ id: item.id, guide_id: parent.id, guide_ref: "ref-x" })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [parent],
      [item],
    );
    expect(preview.summary.items.error).toBe(1);
  });

  it("classifies an existing item with changed values as update, keeping guide_id unchanged", async () => {
    const parent = existingGuide();
    const item = existingItem({ guide_id: parent.id, title: "Old title" });
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ id: item.id, guide_id: parent.id, title: "New title" })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [parent],
      [item],
    );
    expect(preview.summary.items.update).toBe(1);
  });

  it("classifies an existing item with equivalent values as unchanged", async () => {
    const parent = existingGuide();
    const item = existingItem({ guide_id: parent.id, description: null });
    const { guideRows, itemRows } = await parseRows(
      [],
      [itemRow({ id: item.id, guide_id: parent.id, description: "" })],
    );
    const preview = buildGuideImportPreview(
      guideRows,
      itemRows,
      [parent],
      [item],
    );
    expect(preview.summary.items.unchanged).toBe(1);
  });
});
