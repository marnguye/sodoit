import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import {
  buildExperiencesWorkbook,
  EXPERIENCE_EXCEL_COLUMNS,
  EXPERIENCES_SHEET_NAME,
  experienceExportFilename,
  toExperienceExcelRow,
  workbookToBlob,
} from "@/lib/admin/experiences/excel";
import type { ExperienceExportSource } from "@/lib/admin/experiences/excel";

const CANONICAL_HEADERS = [
  "id",
  "title",
  "slug",
  "description",
  "category",
  "difficulty",
  "location_type",
  "country_code",
  "city",
  "image_url",
  "image_alt",
  "featured",
  "is_public",
];

async function readBack(workbook: ExcelJS.Workbook) {
  const blob = await workbookToBlob(workbook);
  const arrayBuffer = await blob.arrayBuffer();
  const roundTrip = new ExcelJS.Workbook();
  await roundTrip.xlsx.load(arrayBuffer);
  return roundTrip;
}

describe("EXPERIENCE_EXCEL_COLUMNS", () => {
  it("matches the canonical export schema and order", () => {
    expect(EXPERIENCE_EXCEL_COLUMNS.map((c) => c.header)).toEqual(
      CANONICAL_HEADERS,
    );
  });
});

describe("toExperienceExcelRow", () => {
  it("coerces null/optional fields to safe values", () => {
    const source = {
      id: "exp-1",
      title: "Watch a sunrise",
      slug: "watch-a-sunrise",
      description: null,
      category: null,
      difficulty: null,
      location_type: "global",
      country_code: null,
      city: null,
      image_url: null,
      image_alt: null,
      featured: null,
      is_public: null,
    } as unknown as ExperienceExportSource;

    const row = toExperienceExcelRow(source);

    expect(row).toEqual({
      id: "exp-1",
      title: "Watch a sunrise",
      slug: "watch-a-sunrise",
      description: "",
      category: "",
      difficulty: "",
      location_type: "global",
      country_code: "",
      city: "",
      image_url: "",
      image_alt: "",
      featured: false,
      is_public: false,
    });
  });

  it("preserves true boolean fields deterministically", () => {
    const row = toExperienceExcelRow({
      id: "exp-2",
      title: "Cook a meal with friends",
      slug: "cook-a-meal-with-friends",
      description: "desc",
      category: "Social",
      difficulty: "Easy",
      location_type: "global",
      country_code: null,
      city: null,
      image_url: null,
      image_alt: null,
      featured: true,
      is_public: true,
    });

    expect(row.featured).toBe(true);
    expect(row.is_public).toBe(true);
  });
});

describe("buildExperiencesWorkbook", () => {
  it("produces a workbook with the Experiences worksheet and canonical headers", async () => {
    const workbook = buildExperiencesWorkbook([]);
    const roundTrip = await readBack(workbook);

    const sheet = roundTrip.getWorksheet(EXPERIENCES_SHEET_NAME);
    expect(sheet).toBeDefined();

    const headerValues = sheet!.getRow(1).values as unknown as (
      string | undefined
    )[];
    expect(headerValues.slice(1)).toEqual(CANONICAL_HEADERS);
  });

  it("freezes the header row and enables autofilter", () => {
    const workbook = buildExperiencesWorkbook([]);
    const sheet = workbook.getWorksheet(EXPERIENCES_SHEET_NAME)!;

    expect(sheet.views?.[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(sheet.autoFilter).toBeTruthy();
  });

  it("serializes data rows in the exact column order", async () => {
    const row = toExperienceExcelRow({
      id: "exp-3",
      title: "Organize a potluck",
      slug: "organize-a-potluck",
      description: "Gather friends",
      category: "Social",
      difficulty: "Easy",
      location_type: "global",
      country_code: null,
      city: null,
      image_url: "https://example.com/image.jpg",
      image_alt: "A potluck table",
      featured: false,
      is_public: true,
    });

    const workbook = buildExperiencesWorkbook([row]);
    const roundTrip = await readBack(workbook);
    const sheet = roundTrip.getWorksheet(EXPERIENCES_SHEET_NAME)!;

    const dataValues = sheet.getRow(2).values as unknown as unknown[];
    expect(dataValues.slice(1)).toEqual([
      "exp-3",
      "Organize a potluck",
      "organize-a-potluck",
      "Gather friends",
      "Social",
      "Easy",
      "global",
      "",
      "",
      "https://example.com/image.jpg",
      "A potluck table",
      false,
      true,
    ]);
  });

  it("produces a blank template with headers but no records", async () => {
    const workbook = buildExperiencesWorkbook([]);
    const roundTrip = await readBack(workbook);
    const sheet = roundTrip.getWorksheet(EXPERIENCES_SHEET_NAME)!;

    expect(sheet.rowCount).toBe(1);
  });
});

describe("experienceExportFilename", () => {
  it("is deterministic and dated", () => {
    const date = new Date("2026-08-17T12:00:00Z");
    expect(experienceExportFilename(date)).toBe(
      "sodoit-experiences-2026-08-17.xlsx",
    );
  });
});
