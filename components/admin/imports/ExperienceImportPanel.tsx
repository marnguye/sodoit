"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import type {
  ExperienceImportChange,
  ExperienceImportPreview,
  ExperienceImportPreviewRow,
} from "@/lib/admin/experiences/import";

type PreviewResponse =
  { ok: true; preview: ExperienceImportPreview } | { ok: false; error: string };

const STATUS_BADGE: Record<
  ExperienceImportPreviewRow["status"],
  { label: string; className: string }
> = {
  create: { label: "Create", className: "bg-success-light text-success" },
  update: { label: "Update", className: "bg-accent-wash text-accent-dark" },
  unchanged: { label: "Unchanged", className: "bg-surface-subtle text-muted" },
  error: { label: "Error", className: "bg-danger-light text-danger" },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
}

export function ExperienceImportPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExperienceImportPreview | null>(null);

  function reset() {
    setFileName(null);
    setError(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setPreview(null);
    setIsPending(true);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/admin/imports/experiences/preview", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as PreviewResponse;

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPreview(result.preview);
    } catch {
      setError("Could not analyze this file. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const errorRows = preview?.rows.filter((row) => row.status === "error") ?? [];
  const createRows =
    preview?.rows.filter((row) => row.status === "create") ?? [];
  const updateRows =
    preview?.rows.filter((row) => row.status === "update") ?? [];
  const unchangedCount = preview?.summary.unchanged ?? 0;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
        >
          {isPending ? "Analyzing..." : "Import Excel"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {fileName && <span className="text-sm text-muted">{fileName}</span>}

        {(preview || error) && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-secondary hover:text-ink"
          >
            Choose another file
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-control border border-danger/20 bg-danger-light px-3.5 py-2.5 text-[13px] text-danger"
        >
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <p className="text-sm font-semibold text-ink">
              {preview.summary.total} rows analyzed
            </p>
            <p className="mt-1 text-sm text-muted">
              No changes have been applied yet.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-pill bg-success-light px-2.5 py-1 text-success">
                {preview.summary.create} create
              </span>
              <span className="rounded-pill bg-accent-wash px-2.5 py-1 text-accent-dark">
                {preview.summary.update} update
              </span>
              <span className="rounded-pill bg-surface-subtle px-2.5 py-1 text-muted">
                {preview.summary.unchanged} unchanged
              </span>
              <span className="rounded-pill bg-danger-light px-2.5 py-1 text-danger">
                {preview.summary.error} errors
              </span>
            </div>
          </div>

          {errorRows.length > 0 && (
            <PreviewSection title={`Errors (${errorRows.length})`}>
              {errorRows.map((row) => (
                <div
                  key={row.rowNumber}
                  className="rounded-control border border-border bg-surface p-3"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge status="error" />
                    <span className="text-xs text-muted">
                      Row {row.rowNumber}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink">
                    {row.status === "error"
                      ? row.title || row.slug || "Untitled row"
                      : ""}
                  </p>
                  <ul className="mt-1 list-inside list-disc text-sm text-danger">
                    {row.status === "error" &&
                      row.errors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </PreviewSection>
          )}

          {updateRows.length > 0 && (
            <PreviewSection title={`Updates (${updateRows.length})`}>
              {updateRows.map((row) =>
                row.status === "update" ? (
                  <div
                    key={row.rowNumber}
                    className="rounded-control border border-border bg-surface p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status="update" />
                      <span className="text-xs text-muted">
                        Row {row.rowNumber}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink">
                      {row.candidate.title}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      {row.changes.map((change) => (
                        <ChangeLine key={change.field} change={change} />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {createRows.length > 0 && (
            <PreviewSection title={`Creates (${createRows.length})`}>
              {createRows.map((row) =>
                row.status === "create" ? (
                  <div
                    key={row.rowNumber}
                    className="rounded-control border border-border bg-surface p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status="create" />
                      <span className="text-xs text-muted">
                        Row {row.rowNumber}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink">
                      {row.candidate.title}
                    </p>
                    <p className="text-xs text-muted">
                      {row.candidate.slug} · {row.candidate.category || "—"}
                      {row.candidate.difficulty
                        ? ` · ${row.candidate.difficulty}`
                        : ""}{" "}
                      · {row.candidate.is_public ? "Published" : "Hidden"}
                    </p>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {unchangedCount > 0 && (
            <p className="text-sm text-muted">
              {unchangedCount} row{unchangedCount === 1 ? "" : "s"} unchanged.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ExperienceImportPreviewRow["status"];
}) {
  const badge = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function ChangeLine({ change }: { change: ExperienceImportChange }) {
  return (
    <div className="text-xs text-secondary">
      <span className="font-semibold text-ink">{change.field}</span>{" "}
      <span className="text-muted">{formatValue(change.before)}</span>
      {" → "}
      <span className="text-ink">{formatValue(change.after)}</span>
    </div>
  );
}
