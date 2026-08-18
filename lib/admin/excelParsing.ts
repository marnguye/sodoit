import "server-only";
import type ExcelJS from "exceljs";

export const MAX_IMPORT_UPLOAD_BYTES = 5 * 1024 * 1024;

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

export function cellText(cell: ExcelJS.Cell): string {
  const text = cell.text;
  return typeof text === "string" ? text.trim() : "";
}

export function isBlankText(value: string): boolean {
  return value.trim().length === 0;
}

export function parseBooleanCell(
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

export function validateSheetHeaders(
  sheet: ExcelJS.Worksheet,
  expectedHeaders: readonly string[],
): boolean {
  const headerRow = sheet.getRow(1);
  return expectedHeaders.every(
    (header, index) => header === cellText(headerRow.getCell(index + 1)),
  );
}
