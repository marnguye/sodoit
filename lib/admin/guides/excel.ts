import "server-only";
import ExcelJS from "exceljs";
import type { Guide, GuideItem } from "@/lib/guides/types";
import { GUIDE_TYPES } from "./validation";
import {
  EXCEL_COLORS,
  setStatusStyle,
  styleBooleanCell,
  styleHeaderRow,
  workbookToBlob as workbookToBlobShared,
} from "@/lib/admin/excelWorkbook";

export const GUIDES_SHEET_NAME = "Guides";
export const GUIDE_ITEMS_SHEET_NAME = "Guide Items";
export const GUIDE_TEMPLATE_FILENAME = "sodoit-guides-template.xlsx";

export interface GuideExcelRow {
  id: string;
  import_ref: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  city: string;
  country_code: string;
  city_slug: string;
  cover_image_url: string;
  cover_image_alt: string;
  duration_label: string;
  featured: boolean;
  is_public: boolean;
  sort_order: number;
  editorial_attribution: string;
}

export interface GuideItemExcelRow {
  id: string;
  guide_id: string;
  guide_ref: string;
  position: number;
  title: string;
  description: string;
  place_id: string;
  place_name: string;
  image_url: string;
  image_alt: string;
  external_url: string;
}

interface ExcelColumn<Row> {
  key: keyof Row;
  header: string;
  width: number;
}

export const GUIDE_EXCEL_COLUMNS: readonly ExcelColumn<GuideExcelRow>[] = [
  { key: "id", header: "id", width: 38 },
  { key: "import_ref", header: "import_ref", width: 24 },
  { key: "title", header: "title", width: 42 },
  { key: "slug", header: "slug", width: 32 },
  { key: "description", header: "description", width: 60 },
  { key: "type", header: "type", width: 14 },
  { key: "city", header: "city", width: 20 },
  { key: "country_code", header: "country_code", width: 14 },
  { key: "city_slug", header: "city_slug", width: 20 },
  { key: "cover_image_url", header: "cover_image_url", width: 44 },
  { key: "cover_image_alt", header: "cover_image_alt", width: 32 },
  { key: "duration_label", header: "duration_label", width: 20 },
  { key: "featured", header: "featured", width: 12 },
  { key: "is_public", header: "is_public", width: 12 },
  { key: "sort_order", header: "sort_order", width: 12 },
  { key: "editorial_attribution", header: "editorial_attribution", width: 28 },
];

export const GUIDE_ITEM_EXCEL_COLUMNS: readonly ExcelColumn<GuideItemExcelRow>[] =
  [
    { key: "id", header: "id", width: 38 },
    { key: "guide_id", header: "guide_id", width: 38 },
    { key: "guide_ref", header: "guide_ref", width: 24 },
    { key: "position", header: "position", width: 10 },
    { key: "title", header: "title", width: 40 },
    { key: "description", header: "description", width: 50 },
    { key: "place_id", header: "place_id", width: 38 },
    { key: "place_name", header: "place_name", width: 28 },
    { key: "image_url", header: "image_url", width: 44 },
    { key: "image_alt", header: "image_alt", width: 32 },
    { key: "external_url", header: "external_url", width: 32 },
  ];

export type GuideExportSource = Pick<
  Guide,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "type"
  | "city"
  | "country_code"
  | "city_slug"
  | "cover_image_url"
  | "cover_image_alt"
  | "duration_label"
  | "featured"
  | "is_public"
  | "sort_order"
  | "editorial_attribution"
>;

export type GuideItemExportSource = Pick<
  GuideItem,
  | "id"
  | "guide_id"
  | "position"
  | "title"
  | "description"
  | "place_id"
  | "place_name"
  | "image_url"
  | "image_alt"
  | "external_url"
>;

export function toGuideExcelRow(guide: GuideExportSource): GuideExcelRow {
  return {
    id: guide.id,
    import_ref: "",
    title: guide.title ?? "",
    slug: guide.slug ?? "",
    description: guide.description ?? "",
    type: guide.type ?? "",
    city: guide.city ?? "",
    country_code: guide.country_code ?? "",
    city_slug: guide.city_slug ?? "",
    cover_image_url: guide.cover_image_url ?? "",
    cover_image_alt: guide.cover_image_alt ?? "",
    duration_label: guide.duration_label ?? "",
    featured: Boolean(guide.featured),
    is_public: Boolean(guide.is_public),
    sort_order: guide.sort_order ?? 0,
    editorial_attribution: guide.editorial_attribution ?? "",
  };
}

export function toGuideItemExcelRow(
  item: GuideItemExportSource,
): GuideItemExcelRow {
  return {
    id: item.id,
    guide_id: item.guide_id,
    guide_ref: "",
    position: item.position ?? 0,
    title: item.title ?? "",
    description: item.description ?? "",
    place_id: item.place_id ?? "",
    place_name: item.place_name ?? "",
    image_url: item.image_url ?? "",
    image_alt: item.image_alt ?? "",
    external_url: item.external_url ?? "",
  };
}

const GUIDE_COLORS = {
  ...EXCEL_COLORS,
  itineraryBackground: "FFDBEAFE",
  itineraryText: "FF1D4ED8",
  collectionBackground: "FFF3E8FF",
  collectionText: "FF7E22CE",
} as const;

function styleTypeCell(cell: ExcelJS.Cell): void {
  const value = String(cell.value ?? "")
    .trim()
    .toLowerCase();

  if (value === "itinerary") {
    setStatusStyle(
      cell,
      GUIDE_COLORS.itineraryBackground,
      GUIDE_COLORS.itineraryText,
    );
    return;
  }

  if (value === "collection") {
    setStatusStyle(
      cell,
      GUIDE_COLORS.collectionBackground,
      GUIDE_COLORS.collectionText,
    );
  }
}

function styleGuideDataRow(row: ExcelJS.Row): void {
  const idCell = row.getCell("id");
  const importRefCell = row.getCell("import_ref");
  const titleCell = row.getCell("title");
  const descriptionCell = row.getCell("description");
  const typeCell = row.getCell("type");
  const featuredCell = row.getCell("featured");
  const publicCell = row.getCell("is_public");

  idCell.font = { color: { argb: GUIDE_COLORS.mutedText } };
  idCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GUIDE_COLORS.mutedBackground },
  };

  importRefCell.font = { color: { argb: GUIDE_COLORS.mutedText } };
  importRefCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GUIDE_COLORS.mutedBackground },
  };

  titleCell.font = { bold: true, color: { argb: GUIDE_COLORS.headerText } };

  descriptionCell.alignment = { vertical: "top", wrapText: true };

  styleTypeCell(typeCell);
  styleBooleanCell(
    featuredCell,
    GUIDE_COLORS.featuredBackground,
    GUIDE_COLORS.featuredText,
  );
  styleBooleanCell(
    publicCell,
    GUIDE_COLORS.publicBackground,
    GUIDE_COLORS.publicText,
  );

  row.alignment = { vertical: "top" };
}

function styleGuideItemDataRow(row: ExcelJS.Row): void {
  const idCell = row.getCell("id");
  const guideIdCell = row.getCell("guide_id");
  const guideRefCell = row.getCell("guide_ref");
  const positionCell = row.getCell("position");
  const titleCell = row.getCell("title");
  const descriptionCell = row.getCell("description");

  idCell.font = { color: { argb: GUIDE_COLORS.mutedText } };
  idCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GUIDE_COLORS.mutedBackground },
  };

  guideIdCell.font = { color: { argb: GUIDE_COLORS.mutedText } };
  guideIdCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GUIDE_COLORS.mutedBackground },
  };

  guideRefCell.font = { color: { argb: GUIDE_COLORS.mutedText } };
  guideRefCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GUIDE_COLORS.mutedBackground },
  };

  positionCell.alignment = { horizontal: "center", vertical: "top" };

  titleCell.font = { bold: true, color: { argb: GUIDE_COLORS.headerText } };

  descriptionCell.alignment = { vertical: "top", wrapText: true };

  row.alignment = { vertical: "top" };
}

function addGuideTypeValidation(sheet: ExcelJS.Worksheet, rowCount: number) {
  const typeColumnIndex =
    GUIDE_EXCEL_COLUMNS.findIndex((column) => column.key === "type") + 1;
  const lastRow = rowCount + 1;

  for (let rowNumber = 2; rowNumber <= lastRow; rowNumber += 1) {
    sheet.getCell(rowNumber, typeColumnIndex).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${GUIDE_TYPES.join(",")}"`],
    };
  }
}

export function buildGuidesWorkbook(
  guideRows: GuideExcelRow[],
  itemRows: GuideItemExcelRow[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Sodoit Admin";
  workbook.created = new Date();

  const guidesSheet = workbook.addWorksheet(GUIDES_SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  guidesSheet.columns = GUIDE_EXCEL_COLUMNS.map((column) => ({
    key: column.key,
    header: column.header,
    width: column.width,
  }));

  styleHeaderRow(guidesSheet);

  for (const guide of guideRows) {
    const row = guidesSheet.addRow(guide);
    styleGuideDataRow(row);
  }

  guidesSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: GUIDE_EXCEL_COLUMNS.length },
  };

  addGuideTypeValidation(guidesSheet, guideRows.length);

  const itemsSheet = workbook.addWorksheet(GUIDE_ITEMS_SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  itemsSheet.columns = GUIDE_ITEM_EXCEL_COLUMNS.map((column) => ({
    key: column.key,
    header: column.header,
    width: column.width,
  }));

  styleHeaderRow(itemsSheet);

  for (const item of itemRows) {
    const row = itemsSheet.addRow(item);
    styleGuideItemDataRow(row);
  }

  itemsSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: GUIDE_ITEM_EXCEL_COLUMNS.length },
  };

  return workbook;
}

export const workbookToBlob = workbookToBlobShared;

export function guideExportFilename(date: Date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `sodoit-guides-${iso}.xlsx`;
}
