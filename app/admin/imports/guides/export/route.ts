import { requireAdminForRequest } from "@/lib/admin/httpAuth";
import { listGuidesForExport } from "@/lib/admin/guides/queries";
import {
  buildGuidesWorkbook,
  guideExportFilename,
  toGuideExcelRow,
  toGuideItemExcelRow,
  workbookToBlob,
} from "@/lib/admin/guides/excel";

export async function GET() {
  const admin = await requireAdminForRequest();
  if (!admin.ok) return admin.response;

  const { guides, items } = await listGuidesForExport();
  const workbook = buildGuidesWorkbook(
    guides.map(toGuideExcelRow),
    items.map(toGuideItemExcelRow),
  );
  const blob = await workbookToBlob(workbook);

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${guideExportFilename()}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
