import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import {
  buildGuidesWorkbook,
  GUIDE_EXCEL_COLUMNS,
  GUIDE_ITEM_EXCEL_COLUMNS,
  GUIDE_ITEMS_SHEET_NAME,
  GUIDES_SHEET_NAME,
  guideExportFilename,
  toGuideExcelRow,
  toGuideItemExcelRow,
  workbookToBlob,
  type GuideExcelRow,
  type GuideItemExcelRow,
} from "@/lib/admin/guides/excel";
import type {
  GuideExportSource,
  GuideItemExportSource,
} from "@/lib/admin/guides/excel";

const GUIDE_HEADERS = [
  "id",
  "title",
  "slug",
  "description",
  "type",
  "city",
  "country_code",
  "city_slug",
  "cover_image_url",
  "cover_image_alt",
  "duration_label",
  "featured",
  "is_public",
  "sort_order",
  "editorial_attribution",
];

const GUIDE_ITEM_HEADERS = [
  "id",
  "guide_id",
  "position",
  "title",
  "description",
  "place_id",
  "place_name",
  "image_url",
  "image_alt",
  "external_url",
];

function guideSource(
  overrides: Partial<GuideExportSource> = {},
): GuideExportSource {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "48 Hours in Prague",
    slug: "48-hours-in-prague",
    description: "A weekend in Prague.",
    type: "itinerary",
    city: "Prague",
    country_code: "CZ",
    city_slug: "prague-cz",
    cover_image_url: "https://example.com/cover.jpg",
    cover_image_alt: "Prague skyline",
    duration_label: "Weekend",
    featured: true,
    is_public: true,
    sort_order: 0,
    editorial_attribution: "Sodoit team",
    ...overrides,
  };
}

function itemSource(
  overrides: Partial<GuideItemExportSource> = {},
): GuideItemExportSource {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    guide_id: "11111111-1111-4111-8111-111111111111",
    position: 0,
    title: "Explore the National Museum",
    description: "A great start.",
    place_id: "33333333-3333-4333-8333-333333333333",
    place_name: "National Museum",
    image_url: "https://example.com/museum.jpg",
    image_alt: "Museum facade",
    external_url: "https://example.com",
    ...overrides,
  };
}

async function readBack(workbook: ExcelJS.Workbook) {
  const blob = await workbookToBlob(workbook);
  const arrayBuffer = await blob.arrayBuffer();
  const roundTrip = new ExcelJS.Workbook();
  await roundTrip.xlsx.load(arrayBuffer);
  return roundTrip;
}

describe("Guide Excel column contract", () => {
  it("has the canonical Guide column order", () => {
    expect(GUIDE_EXCEL_COLUMNS.map((c) => c.header)).toEqual(GUIDE_HEADERS);
  });

  it("has the canonical Guide Item column order", () => {
    expect(GUIDE_ITEM_EXCEL_COLUMNS.map((c) => c.header)).toEqual(
      GUIDE_ITEM_HEADERS,
    );
  });
});

describe("toGuideExcelRow / toGuideItemExcelRow", () => {
  it("coerces null Guide fields to blank/zero safely", () => {
    const row = toGuideExcelRow(
      guideSource({
        description: null,
        city_slug: null,
        cover_image_url: null,
        cover_image_alt: null,
        duration_label: null,
        editorial_attribution: null,
        sort_order: undefined,
        type: undefined,
      }),
    );

    expect(row.description).toBe("");
    expect(row.city_slug).toBe("");
    expect(row.cover_image_url).toBe("");
    expect(row.duration_label).toBe("");
    expect(row.editorial_attribution).toBe("");
    expect(row.sort_order).toBe(0);
    expect(row.type).toBe("");
  });

  it("keeps sort_order numeric, not stringified", () => {
    const row = toGuideExcelRow(guideSource({ sort_order: 7 }));
    expect(row.sort_order).toBe(7);
    expect(typeof row.sort_order).toBe("number");
  });

  it("preserves booleans deterministically", () => {
    const row = toGuideExcelRow(
      guideSource({ featured: false, is_public: true }),
    );
    expect(row.featured).toBe(false);
    expect(row.is_public).toBe(true);
  });

  it("coerces null Guide Item fields to blank safely and keeps guide_id linkage", () => {
    const row = toGuideItemExcelRow(
      itemSource({ description: null, place_id: null, place_name: null }),
    );

    expect(row.description).toBe("");
    expect(row.place_id).toBe("");
    expect(row.place_name).toBe("");
    expect(row.guide_id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("keeps position numeric", () => {
    const row = toGuideItemExcelRow(itemSource({ position: 3 }));
    expect(row.position).toBe(3);
    expect(typeof row.position).toBe("number");
  });
});

describe("buildGuidesWorkbook", () => {
  it("produces exactly the Guides and Guide Items sheets", async () => {
    const workbook = buildGuidesWorkbook([], []);
    const roundTrip = await readBack(workbook);

    const names = roundTrip.worksheets.map((sheet) => sheet.name);
    expect(names).toEqual([GUIDES_SHEET_NAME, GUIDE_ITEMS_SHEET_NAME]);
  });

  it("writes exact ordered headers on both sheets", async () => {
    const workbook = buildGuidesWorkbook([], []);
    const roundTrip = await readBack(workbook);

    const guideHeaders = roundTrip.getWorksheet(GUIDES_SHEET_NAME)!.getRow(1)
      .values as unknown as (string | undefined)[];
    expect(guideHeaders.slice(1)).toEqual(GUIDE_HEADERS);

    const itemHeaders = roundTrip
      .getWorksheet(GUIDE_ITEMS_SHEET_NAME)!
      .getRow(1).values as unknown as (string | undefined)[];
    expect(itemHeaders.slice(1)).toEqual(GUIDE_ITEM_HEADERS);
  });

  it("serializes a Guide Item row linked by guide_id, with numeric fields intact", async () => {
    const guideRow: GuideExcelRow = toGuideExcelRow(guideSource());
    const itemRow: GuideItemExcelRow = toGuideItemExcelRow(itemSource());

    const workbook = buildGuidesWorkbook([guideRow], [itemRow]);
    const roundTrip = await readBack(workbook);

    const itemValues = roundTrip.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.getRow(2)
      .values as unknown as unknown[];

    expect(itemValues.slice(1)).toEqual([
      itemRow.id,
      guideRow.id,
      0,
      itemRow.title,
      itemRow.description,
      itemRow.place_id,
      itemRow.place_name,
      itemRow.image_url,
      itemRow.image_alt,
      itemRow.external_url,
    ]);
    expect(typeof itemValues[3]).toBe("number");
  });

  it("produces a blank template with headers but no records on either sheet", async () => {
    const workbook = buildGuidesWorkbook([], []);
    const roundTrip = await readBack(workbook);

    expect(roundTrip.getWorksheet(GUIDES_SHEET_NAME)!.rowCount).toBe(1);
    expect(roundTrip.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!.rowCount).toBe(1);
  });

  it("freezes the header row and enables autofilter on both sheets", () => {
    const workbook = buildGuidesWorkbook([], []);

    const guidesSheet = workbook.getWorksheet(GUIDES_SHEET_NAME)!;
    const itemsSheet = workbook.getWorksheet(GUIDE_ITEMS_SHEET_NAME)!;

    expect(guidesSheet.views?.[0]).toMatchObject({
      state: "frozen",
      ySplit: 1,
    });
    expect(guidesSheet.autoFilter).toBeTruthy();
    expect(itemsSheet.views?.[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(itemsSheet.autoFilter).toBeTruthy();
  });
});

describe("guideExportFilename", () => {
  it("is deterministic and dated", () => {
    const date = new Date("2026-08-18T12:00:00Z");
    expect(guideExportFilename(date)).toBe("sodoit-guides-2026-08-18.xlsx");
  });
});
