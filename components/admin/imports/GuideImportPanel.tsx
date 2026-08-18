"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import type {
  GuideImportChange,
  GuideImportPreview,
  GuideItemImportChange,
} from "@/lib/admin/guides/import";

type PreviewResponse =
  { ok: true; preview: GuideImportPreview } | { ok: false; error: string };

const STATUS_BADGE: Record<
  "create" | "update" | "unchanged" | "error",
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

function StatusBadge({
  status,
}: {
  status: "create" | "update" | "unchanged" | "error";
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

function SummaryPills({
  summary,
}: {
  summary: { create: number; update: number; unchanged: number; error: number };
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold">
      <span className="rounded-pill bg-success-light px-2.5 py-1 text-success">
        {summary.create} create
      </span>
      <span className="rounded-pill bg-accent-wash px-2.5 py-1 text-accent-dark">
        {summary.update} update
      </span>
      <span className="rounded-pill bg-surface-subtle px-2.5 py-1 text-muted">
        {summary.unchanged} unchanged
      </span>
      <span className="rounded-pill bg-danger-light px-2.5 py-1 text-danger">
        {summary.error} errors
      </span>
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

function GuideChangeLine({ change }: { change: GuideImportChange }) {
  return (
    <div className="text-xs text-secondary">
      <span className="font-semibold text-ink">{change.field}</span>{" "}
      <span className="text-muted">{formatValue(change.before)}</span>
      {" → "}
      <span className="text-ink">{formatValue(change.after)}</span>
    </div>
  );
}

function ItemChangeLine({ change }: { change: GuideItemImportChange }) {
  return (
    <div className="text-xs text-secondary">
      <span className="font-semibold text-ink">{change.field}</span>{" "}
      <span className="text-muted">{formatValue(change.before)}</span>
      {" → "}
      <span className="text-ink">{formatValue(change.after)}</span>
    </div>
  );
}

export function GuideImportPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GuideImportPreview | null>(null);

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
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/admin/imports/guides/preview", {
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
      setIsAnalyzing(false);
    }
  }

  const guideErrors =
    preview?.guides.filter((row) => row.status === "error") ?? [];
  const guideUpdates =
    preview?.guides.filter((row) => row.status === "update") ?? [];
  const guideCreates =
    preview?.guides.filter((row) => row.status === "create") ?? [];

  const itemErrors =
    preview?.items.filter((row) => row.status === "error") ?? [];
  const itemUpdates =
    preview?.items.filter((row) => row.status === "update") ?? [];
  const itemCreates =
    preview?.items.filter((row) => row.status === "create") ?? [];

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Import Excel"}
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
        <div className="mt-6 flex flex-col gap-8">
          <p className="text-sm text-muted">
            No changes have been applied yet.
          </p>

          <div>
            <p className="text-sm font-semibold text-ink">
              Guides — {preview.summary.guides.total} analyzed
            </p>
            <div className="mt-2">
              <SummaryPills summary={preview.summary.guides} />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">
              Guide Items — {preview.summary.items.total} analyzed
            </p>
            <div className="mt-2">
              <SummaryPills summary={preview.summary.items} />
            </div>
          </div>

          {guideErrors.length > 0 && (
            <PreviewSection title={`Guide errors (${guideErrors.length})`}>
              {guideErrors.map((row) =>
                row.status === "error" ? (
                  <div
                    key={row.rowNumber}
                    className="rounded-control border border-border bg-surface p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status="error" />
                      <span className="text-xs text-muted">
                        Guide · Row {row.rowNumber}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink">
                      {row.title || row.slug || row.importRef || "Untitled row"}
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-danger">
                      {row.errors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {itemErrors.length > 0 && (
            <PreviewSection title={`Guide Item errors (${itemErrors.length})`}>
              {itemErrors.map((row) =>
                row.status === "error" ? (
                  <div
                    key={row.rowNumber}
                    className="rounded-control border border-border bg-surface p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status="error" />
                      <span className="text-xs text-muted">
                        Guide Item · Row {row.rowNumber}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink">
                      {row.title ||
                        row.guideRef ||
                        row.guideId ||
                        "Untitled row"}
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-danger">
                      {row.errors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {guideUpdates.length > 0 && (
            <PreviewSection title={`Guide updates (${guideUpdates.length})`}>
              {guideUpdates.map((row) =>
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
                        <GuideChangeLine key={change.field} change={change} />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {itemUpdates.length > 0 && (
            <PreviewSection
              title={`Guide Item updates (${itemUpdates.length})`}
            >
              {itemUpdates.map((row) =>
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
                        <ItemChangeLine key={change.field} change={change} />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {guideCreates.length > 0 && (
            <PreviewSection title={`Guide creates (${guideCreates.length})`}>
              {guideCreates.map((row) =>
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
                      {row.candidate.slug} · {row.candidate.type || "—"} ·{" "}
                      {row.candidate.city}
                      {row.candidate.importRef
                        ? ` · import_ref: ${row.candidate.importRef}`
                        : ""}
                    </p>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {itemCreates.length > 0 && (
            <PreviewSection
              title={`Guide Item creates (${itemCreates.length})`}
            >
              {itemCreates.map((row) =>
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
                      {row.parent.kind === "new"
                        ? `→ New Guide: ${row.parent.importRef}`
                        : "→ Existing guide"}
                    </p>
                  </div>
                ) : null,
              )}
            </PreviewSection>
          )}

          {preview.summary.guides.unchanged > 0 && (
            <p className="text-sm text-muted">
              {preview.summary.guides.unchanged} Guide
              {preview.summary.guides.unchanged === 1 ? "" : "s"} unchanged.
            </p>
          )}
          {preview.summary.items.unchanged > 0 && (
            <p className="text-sm text-muted">
              {preview.summary.items.unchanged} Guide Item
              {preview.summary.items.unchanged === 1 ? "" : "s"} unchanged.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
