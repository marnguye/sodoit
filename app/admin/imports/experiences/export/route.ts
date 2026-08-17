import { requireAdminForRequest } from "@/lib/admin/httpAuth";
import { listExperiencesForExport } from "@/lib/admin/experiences/queries";
import {
  buildExperiencesWorkbook,
  experienceExportFilename,
  toExperienceExcelRow,
  workbookToBlob,
} from "@/lib/admin/experiences/excel";

export async function GET() {
  const admin = await requireAdminForRequest();
  if (!admin.ok) return admin.response;

  const experiences = await listExperiencesForExport();
  const workbook = buildExperiencesWorkbook(
    experiences.map(toExperienceExcelRow),
  );
  const blob = await workbookToBlob(workbook);

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${experienceExportFilename()}"`,
      "Cache-Control": "no-store",
    },
  });
}
