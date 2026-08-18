import { requireAdminForRequest } from "@/lib/admin/httpAuth";
import { listExperiencesForExport } from "@/lib/admin/experiences/queries";
import {
  buildExperienceImportPreview,
  parseExperiencesWorkbook,
} from "@/lib/admin/experiences/import";
import { readXlsxUpload } from "@/lib/admin/experiences/uploadGuard";
import { logger } from "@/lib/logger";

function badRequest(error: string) {
  return Response.json({ ok: false, error }, { status: 400 });
}

export async function POST(request: Request) {
  const admin = await requireAdminForRequest();
  if (!admin.ok) return admin.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Could not read the upload.");
  }

  const upload = await readXlsxUpload(formData);
  if (!upload.ok) return badRequest(upload.error);

  const parseResult = await parseExperiencesWorkbook(upload.buffer);
  if (!parseResult.ok) {
    return badRequest(parseResult.error);
  }

  try {
    const existing = await listExperiencesForExport();
    const preview = buildExperienceImportPreview(parseResult.rows, existing);
    return Response.json({ ok: true, preview });
  } catch (error) {
    logger.error("admin.experiences.import_preview_failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return Response.json(
      { ok: false, error: "Could not build the import preview." },
      { status: 500 },
    );
  }
}
