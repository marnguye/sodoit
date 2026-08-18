import "server-only";
import type ExcelJS from "exceljs";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function workbookToBlob(
  workbook: ExcelJS.Workbook,
): Promise<Blob> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();

  return new Blob([arrayBuffer], {
    type: XLSX_CONTENT_TYPE,
  });
}

export const EXCEL_COLORS = {
  headerBackground: "FFF3F3F1",
  headerText: "FF1C1917",
  border: "FFE7E5E4",

  mutedBackground: "FFF7F7F5",
  mutedText: "FF78716C",

  publicBackground: "FFDCFCE7",
  publicText: "FF166534",

  featuredBackground: "FFFFEDD5",
  featuredText: "FFC2410C",
} as const;

export function setStatusStyle(
  cell: ExcelJS.Cell,
  background: string,
  text: string,
): void {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: background },
  };

  cell.font = {
    bold: true,
    color: { argb: text },
  };

  cell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
}

export function styleBooleanCell(
  cell: ExcelJS.Cell,
  trueBackground: string,
  trueText: string,
): void {
  if (cell.value === true) {
    setStatusStyle(cell, trueBackground, trueText);
    return;
  }

  setStatusStyle(cell, EXCEL_COLORS.mutedBackground, EXCEL_COLORS.mutedText);
}

export function styleHeaderRow(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);

  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: EXCEL_COLORS.headerText },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_COLORS.headerBackground },
    };

    cell.alignment = {
      vertical: "middle",
    };

    cell.border = {
      bottom: {
        style: "thin",
        color: { argb: EXCEL_COLORS.border },
      },
    };
  });
}
