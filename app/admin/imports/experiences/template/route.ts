import { requireAdminForRequest } from "@/lib/admin/httpAuth";
import {
  buildExperiencesWorkbook,
  EXPERIENCE_TEMPLATE_FILENAME,
  workbookToBlob,
} from "@/lib/admin/experiences/excel";

export async function GET() {
  const admin = await requireAdminForRequest();
  if (!admin.ok) return admin.response;

  const workbook = buildExperiencesWorkbook([]);
  const blob = await workbookToBlob(workbook);

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${EXPERIENCE_TEMPLATE_FILENAME}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
