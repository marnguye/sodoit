import { requireAdminForRequest } from "@/lib/admin/httpAuth";
import { listExperiencesForExport } from "@/lib/admin/experiences/queries";
import {
  buildExperienceImportPreview,
  hasXlsxSignature,
  MAX_IMPORT_UPLOAD_BYTES,
  parseExperiencesWorkbook,
} from "@/lib/admin/experiences/import";
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

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequest("No file was uploaded.");
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return badRequest("Only .xlsx files are supported.");
  }

  if (file.size === 0) {
    return badRequest("The uploaded file is empty.");
  }

  if (file.size > MAX_IMPORT_UPLOAD_BYTES) {
    return badRequest(
      `File is too large (max ${Math.floor(MAX_IMPORT_UPLOAD_BYTES / (1024 * 1024))} MB).`,
    );
  }

  const buffer = await file.arrayBuffer();

  if (!hasXlsxSignature(buffer)) {
    return badRequest("This does not look like a valid .xlsx file.");
  }

  const parseResult = await parseExperiencesWorkbook(buffer);
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
