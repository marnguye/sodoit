import "server-only";
import { hasXlsxSignature, MAX_IMPORT_UPLOAD_BYTES } from "./import";

export type XlsxUploadResult =
  { ok: true; buffer: ArrayBuffer } | { ok: false; error: string };

export async function readXlsxUpload(
  formData: FormData,
  fieldName = "file",
): Promise<XlsxUploadResult> {
  const file = formData.get(fieldName);

  if (!(file instanceof File)) {
    return { ok: false, error: "No file was uploaded." };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { ok: false, error: "Only .xlsx files are supported." };
  }

  if (file.size === 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }

  if (file.size > MAX_IMPORT_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large (max ${Math.floor(MAX_IMPORT_UPLOAD_BYTES / (1024 * 1024))} MB).`,
    };
  }

  const buffer = await file.arrayBuffer();

  if (!hasXlsxSignature(buffer)) {
    return { ok: false, error: "This does not look like a valid .xlsx file." };
  }

  return { ok: true, buffer };
}
