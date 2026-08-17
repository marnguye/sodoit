import "server-only";
import ExcelJS from "exceljs";
import { EXPERIENCE_EXCEL_COLUMNS, EXPERIENCES_SHEET_NAME } from "./excel";
import { validateExperienceInput, type ExperienceInput } from "./validation";
import type { ExperienceExportItem } from "./queries";

export const MAX_IMPORT_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface ExperienceImportCandidate {
  id: string | null;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  location_type: string;
  country_code: string | null;
  city: string | null;
  image_url: string | null;
  image_alt: string | null;
  featured: boolean;
  is_public: boolean;
}

const CANDIDATE_FIELDS = EXPERIENCE_EXCEL_COLUMNS.filter(
  (column) => column.key !== "id",
).map((column) => column.key);

interface RawRowDisplay {
  id: string | null;
  title: string | null;
  slug: string | null;
}

type ParsedRow =
  | {
      rowNumber: number;
      kind: "candidate";
      candidate: ExperienceImportCandidate;
    }
  | { rowNumber: number; kind: "error"; raw: RawRowDisplay; errors: string[] };

export type ParseWorkbookResult =
  { ok: true; rows: ParsedRow[] } | { ok: false; error: string };

function isBlankText(value: string) {
  return value.trim().length === 0;
}

function parseBooleanCell(
  cell: ExcelJS.Cell,
  header: string,
): { ok: true; value: boolean } | { ok: false; error: string } {
  if (cell.value === null || cell.value === undefined)
    return { ok: true, value: false };

  if (typeof cell.value === "boolean") return { ok: true, value: cell.value };

  if (typeof cell.value === "string") {
    const normalized = cell.value.trim().toLowerCase();
    if (normalized === "") return { ok: true, value: false };
    if (normalized === "true") return { ok: true, value: true };
    if (normalized === "false") return { ok: true, value: false };
  }

  return { ok: false, error: `Column "${header}" must be TRUE or FALSE.` };
}

function cellText(cell: ExcelJS.Cell): string {
  const text = cell.text;
  return typeof text === "string" ? text.trim() : "";
}

export async function parseExperiencesWorkbook(
  buffer: ArrayBuffer,
): Promise<ParseWorkbookResult> {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return {
      ok: false,
      error: "Could not read this file as an Excel workbook.",
    };
  }

  const sheet = workbook.getWorksheet(EXPERIENCES_SHEET_NAME);
  if (!sheet) {
    return {
      ok: false,
      error: `Missing the "${EXPERIENCES_SHEET_NAME}" worksheet. Re-download the template and try again.`,
    };
  }

  const headerRow = sheet.getRow(1);
  const expectedHeaders = EXPERIENCE_EXCEL_COLUMNS.map(
    (column) => column.header,
  );
  const actualHeaders = EXPERIENCE_EXCEL_COLUMNS.map((_, index) =>
    cellText(headerRow.getCell(index + 1)),
  );

  const headersMatch = expectedHeaders.every(
    (header, index) => header === actualHeaders[index],
  );
  if (!headersMatch) {
    return {
      ok: false,
      error:
        "Unexpected column headers. Re-download the template and try again.",
    };
  }

  const rows: ParsedRow[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const values: Record<string, string | boolean> = {};
    const errors: string[] = [];

    EXPERIENCE_EXCEL_COLUMNS.forEach((column, index) => {
      const cell = row.getCell(index + 1);

      if (cell.type === ExcelJS.ValueType.Formula) {
        errors.push(
          `Column "${column.header}" contains a formula, which is not supported.`,
        );
        return;
      }

      if (column.key === "featured" || column.key === "is_public") {
        const parsed = parseBooleanCell(cell, column.header);
        if (parsed.ok) values[column.key] = parsed.value;
        else errors.push(parsed.error);
        return;
      }

      values[column.key] = cellText(cell);
    });

    const rawDisplay: RawRowDisplay = {
      id: typeof values.id === "string" && values.id ? values.id : null,
      title:
        typeof values.title === "string" && values.title ? values.title : null,
      slug: typeof values.slug === "string" && values.slug ? values.slug : null,
    };

    const isBlankRow =
      errors.length === 0 &&
      EXPERIENCE_EXCEL_COLUMNS.every((column) => {
        const value = values[column.key];
        return typeof value === "boolean"
          ? value === false
          : isBlankText(String(value ?? ""));
      });
    if (isBlankRow) return;

    if (errors.length > 0) {
      rows.push({ rowNumber, kind: "error", raw: rawDisplay, errors });
      return;
    }

    const candidate: ExperienceImportCandidate = {
      id: (values.id as string) || null,
      title: values.title as string,
      slug: values.slug as string,
      description: (values.description as string) || null,
      category: values.category as string,
      difficulty: (values.difficulty as string) || null,
      location_type: values.location_type as string,
      country_code: (values.country_code as string) || null,
      city: (values.city as string) || null,
      image_url: (values.image_url as string) || null,
      image_alt: (values.image_alt as string) || null,
      featured: values.featured as boolean,
      is_public: values.is_public as boolean,
    };

    rows.push({ rowNumber, kind: "candidate", candidate });
  });

  return { ok: true, rows };
}

export interface ExperienceImportChange {
  field: (typeof CANDIDATE_FIELDS)[number];
  before: unknown;
  after: unknown;
}

export type ExperienceImportPreviewRow =
  | {
      status: "create";
      rowNumber: number;
      candidate: ExperienceImportCandidate;
    }
  | {
      status: "update";
      rowNumber: number;
      id: string;
      candidate: ExperienceImportCandidate;
      changes: ExperienceImportChange[];
    }
  | { status: "unchanged"; rowNumber: number; id: string }
  | {
      status: "error";
      rowNumber: number;
      id: string | null;
      title: string | null;
      slug: string | null;
      errors: string[];
    };

export interface ExperienceImportPreview {
  rows: ExperienceImportPreviewRow[];
  summary: {
    total: number;
    create: number;
    update: number;
    unchanged: number;
    error: number;
  };
}

function toValidationInput(
  candidate: ExperienceImportCandidate,
): ExperienceInput {
  return {
    title: candidate.title,
    slug: candidate.slug,
    description: candidate.description ?? "",
    category: candidate.category,
    difficulty: candidate.difficulty ?? "",
    location_type: candidate.location_type,
    country_code: candidate.country_code ?? "",
    city: candidate.city ?? "",
    image_url: candidate.image_url ?? "",
    image_alt: candidate.image_alt ?? "",
    featured: candidate.featured,
    is_public: candidate.is_public,
  };
}

function diffCandidate(
  candidate: ExperienceImportCandidate,
  existing: ExperienceExportItem,
): ExperienceImportChange[] {
  const changes: ExperienceImportChange[] = [];

  for (const field of CANDIDATE_FIELDS) {
    const after = candidate[field];
    const before = existing[field] ?? null;
    if (before !== after) changes.push({ field, before, after });
  }

  return changes;
}

export function buildExperienceImportPreview(
  rows: ParsedRow[],
  existing: ExperienceExportItem[],
): ExperienceImportPreview {
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const existingBySlug = new Map(existing.map((row) => [row.slug, row]));

  const idRowNumbers = new Map<string, number[]>();
  const slugRowNumbers = new Map<string, number[]>();

  for (const row of rows) {
    if (row.kind !== "candidate") continue;
    if (row.candidate.id) {
      const list = idRowNumbers.get(row.candidate.id) ?? [];
      list.push(row.rowNumber);
      idRowNumbers.set(row.candidate.id, list);
    }
    const slugList = slugRowNumbers.get(row.candidate.slug) ?? [];
    slugList.push(row.rowNumber);
    slugRowNumbers.set(row.candidate.slug, slugList);
  }

  const previewRows: ExperienceImportPreviewRow[] = rows.map((row) => {
    if (row.kind === "error") {
      return {
        status: "error",
        rowNumber: row.rowNumber,
        id: row.raw.id,
        title: row.raw.title,
        slug: row.raw.slug,
        errors: row.errors,
      };
    }

    const { candidate } = row;
    const errors: string[] = [];

    if (candidate.id && (idRowNumbers.get(candidate.id)?.length ?? 0) > 1) {
      errors.push("This id appears more than once in this file.");
    }

    if ((slugRowNumbers.get(candidate.slug)?.length ?? 0) > 1) {
      errors.push("This slug appears more than once in this file.");
    }

    const domainError = validateExperienceInput(toValidationInput(candidate));
    if (domainError) errors.push(domainError);

    let existingRow: ExperienceExportItem | undefined;
    if (candidate.id) {
      existingRow = existingById.get(candidate.id);
      if (!existingRow) errors.push("No experience exists with this id.");
    }

    const slugOwner = existingBySlug.get(candidate.slug);
    if (slugOwner && slugOwner.id !== candidate.id) {
      errors.push("This slug is already used by another experience.");
    }

    if (errors.length > 0) {
      return {
        status: "error",
        rowNumber: row.rowNumber,
        id: candidate.id,
        title: candidate.title || null,
        slug: candidate.slug || null,
        errors,
      };
    }

    if (!candidate.id) {
      return { status: "create", rowNumber: row.rowNumber, candidate };
    }

    const changes = diffCandidate(candidate, existingRow!);
    if (changes.length === 0) {
      return {
        status: "unchanged",
        rowNumber: row.rowNumber,
        id: candidate.id,
      };
    }

    return {
      status: "update",
      rowNumber: row.rowNumber,
      id: candidate.id,
      candidate,
      changes,
    };
  });

  const summary = {
    total: previewRows.length,
    create: previewRows.filter((row) => row.status === "create").length,
    update: previewRows.filter((row) => row.status === "update").length,
    unchanged: previewRows.filter((row) => row.status === "unchanged").length,
    error: previewRows.filter((row) => row.status === "error").length,
  };

  return { rows: previewRows, summary };
}

export function hasXlsxSignature(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer, 0, 4);
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}
