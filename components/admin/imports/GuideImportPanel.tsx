"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import type {
  GuideImportChange,
  GuideImportPreview,
  GuideItemImportChange,
} from "@/lib/admin/guides/import";
import type { GuideApplyConflict } from "@/lib/admin/guides/apply";

type PreviewResponse =
  { ok: true; preview: GuideImportPreview } | { ok: false; error: string };

interface ApplyEntitySummary {
  created: { id: string; title: string }[];
  updated: { id: string; title: string }[];
}

type ApplyResponse =
  | { ok: true; guides: ApplyEntitySummary; items: ApplyEntitySummary }
  | {
      ok: false;
      kind: "invalid_file" | "validation_error" | "apply_failed";
      error: string;
    }
  | {
      ok: false;
      kind: "stale_preview";
      error: string;
      conflicts: GuideApplyConflict[];
    };

type ApplyState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; guides: ApplyEntitySummary; items: ApplyEntitySummary }
  | { status: "stale"; conflicts: GuideApplyConflict[] }
  | { status: "error"; message: string };

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
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GuideImportPreview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>({ status: "idle" });

  function reset() {
    setFile(null);
    setPreviewError(null);
    setPreview(null);
    setConfirmOpen(false);
    setApplyState({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewError(null);
    setPreview(null);
    setConfirmOpen(false);
    setApplyState({ status: "idle" });
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.set("file", selected);

    try {
      const response = await fetch("/admin/imports/guides/preview", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as PreviewResponse;

      if (!result.ok) {
        setPreviewError(result.error);
        return;
      }

      setPreview(result.preview);
    } catch {
      setPreviewError("Could not analyze this file. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleApply() {
    if (!file || !preview || applyState.status === "pending") return;

    setApplyState({ status: "pending" });

    const guideFingerprints = Object.fromEntries(
      preview.guides
        .filter((row) => row.status === "update")
        .map((row) => [row.id, row.baseFingerprint]),
    );
    const itemFingerprints = Object.fromEntries(
      preview.items
        .filter((row) => row.status === "update")
        .map((row) => [row.id, row.baseFingerprint]),
    );

    const formData = new FormData();
    formData.set("file", file);
    formData.set("guideFingerprints", JSON.stringify(guideFingerprints));
    formData.set("itemFingerprints", JSON.stringify(itemFingerprints));

    try {
      const response = await fetch("/admin/imports/guides/apply", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as ApplyResponse;

      if (result.ok) {
        setApplyState({
          status: "success",
          guides: result.guides,
          items: result.items,
        });
        setPreview(null);
        setConfirmOpen(false);
        return;
      }

      if (result.kind === "stale_preview") {
        setApplyState({ status: "stale", conflicts: result.conflicts });
        setPreview(null);
        setConfirmOpen(false);
        return;
      }

      setApplyState({ status: "error", message: result.error });
    } catch {
      setApplyState({
        status: "error",
        message: "Could not apply this import. Please try again.",
      });
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

  const canApply =
    Boolean(preview) &&
    preview!.summary.guides.error === 0 &&
    preview!.summary.items.error === 0 &&
    preview!.summary.guides.create +
      preview!.summary.guides.update +
      preview!.summary.items.create +
      preview!.summary.items.update >
      0;

  const totalChanges = preview
    ? preview.summary.guides.create +
      preview.summary.guides.update +
      preview.summary.items.create +
      preview.summary.items.update
    : 0;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isAnalyzing || applyState.status === "pending"}
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

        {file && <span className="text-sm text-muted">{file.name}</span>}

        {(preview || previewError || applyState.status !== "idle") && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-secondary hover:text-ink"
          >
            Choose another file
          </button>
        )}
      </div>

      {previewError && (
        <p
          role="alert"
          className="mt-4 rounded-control border border-danger/20 bg-danger-light px-3.5 py-2.5 text-[13px] text-danger"
        >
          {previewError}
        </p>
      )}

      {applyState.status === "stale" && (
        <div className="mt-4 rounded-control border border-danger/20 bg-danger-light p-3.5">
          <p className="text-sm font-semibold text-danger">
            Import needs review
          </p>
          <p className="mt-1 text-[13px] text-danger">
            Some Guides or Guide Items changed since this preview was generated.
            Choose the workbook again and review the latest diff before
            applying.
          </p>
          {applyState.conflicts.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-[13px] text-danger">
              {applyState.conflicts.map((conflict) => (
                <li key={`${conflict.entity}-${conflict.id}`}>
                  {conflict.entity === "guide" ? "Guide" : "Guide Item"}:{" "}
                  {conflict.title || conflict.id}
                  {conflict.reason === "changed"
                    ? " — changed in the database"
                    : " — could not verify against the database"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {applyState.status === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-control border border-danger/20 bg-danger-light px-3.5 py-2.5 text-[13px] text-danger"
        >
          {applyState.message}
        </p>
      )}

      {applyState.status === "success" && (
        <div className="mt-4 rounded-control border border-success/20 bg-success-light p-3.5">
          <p className="text-sm font-semibold text-success">Import completed</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-success">
            <div className="flex gap-4">
              <span>Guides created {applyState.guides.created.length}</span>
              <span>Guides updated {applyState.guides.updated.length}</span>
            </div>
            <div className="flex gap-4">
              <span>Guide Items created {applyState.items.created.length}</span>
              <span>Guide Items updated {applyState.items.updated.length}</span>
            </div>
          </div>
          {(applyState.guides.created.length > 0 ||
            applyState.guides.updated.length > 0) && (
            <ul className="mt-2 list-inside list-disc text-[13px] text-success">
              {[...applyState.guides.created, ...applyState.guides.updated]
                .slice(0, 8)
                .map((row) => (
                  <li key={row.id}>{row.title}</li>
                ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-3">
            <a
              href="/admin/imports/guides/export"
              className="text-sm font-medium text-secondary hover:text-ink"
            >
              Export current data again
            </a>
          </div>
        </div>
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

          {canApply && !confirmOpen && (
            <Button
              type="button"
              className="self-start"
              onClick={() => setConfirmOpen(true)}
            >
              Apply changes
            </Button>
          )}

          {!canApply && (guideErrors.length > 0 || itemErrors.length > 0) && (
            <p className="text-sm text-danger">
              Fix the errors below before this workbook can be applied.
            </p>
          )}

          {canApply && confirmOpen && (
            <div className="rounded-control border border-border bg-surface-subtle p-3.5">
              <p className="text-sm font-semibold text-ink">
                Apply {totalChanges} changes?
              </p>
              <div className="mt-2 text-[13px] text-secondary">
                <p>
                  Guides — {preview.summary.guides.create} create,{" "}
                  {preview.summary.guides.update} update
                </p>
                <p>
                  Guide Items — {preview.summary.items.create} create,{" "}
                  {preview.summary.items.update} update
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={applyState.status === "pending"}
                >
                  {applyState.status === "pending"
                    ? "Applying..."
                    : "Apply changes"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmOpen(false)}
                  disabled={applyState.status === "pending"}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

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
