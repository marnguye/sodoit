import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { listGuidesForExport } from "./queries";
import {
  buildGuideImportPreview,
  parseGuidesWorkbook,
  type GuideImportCandidate,
  type GuideImportParent,
  type GuideImportPreview,
  type GuideItemImportCandidate,
} from "./import";

export type ApplyFingerprints = Record<string, string>;

export interface GuideApplyConflict {
  entity: "guide" | "item";
  id: string;
  title: string | null;
  reason: "changed" | "missing_fingerprint";
}

interface ApplyEntitySummary {
  created: { id: string; title: string }[];
  updated: { id: string; title: string }[];
}

export type GuideApplyResult =
  | { ok: true; guides: ApplyEntitySummary; items: ApplyEntitySummary }
  | { ok: false; kind: "invalid_file"; error: string }
  | { ok: false; kind: "validation_error"; preview: GuideImportPreview }
  | { ok: false; kind: "stale_preview"; conflicts: GuideApplyConflict[] }
  | { ok: false; kind: "apply_failed"; error: string };

function toGuideRow(candidate: GuideImportCandidate) {
  return {
    title: candidate.title,
    slug: candidate.slug,
    description: candidate.description,
    type: candidate.type,
    city: candidate.city,
    country_code: candidate.country_code,
    city_slug: candidate.city_slug,
    cover_image_url: candidate.cover_image_url,
    cover_image_alt: candidate.cover_image_alt,
    duration_label: candidate.duration_label,
    featured: candidate.featured,
    is_public: candidate.is_public,
    sort_order: candidate.sort_order,
    editorial_attribution: candidate.editorial_attribution,
  };
}

function toGuideItemUpdateRow(candidate: GuideItemImportCandidate) {
  return {
    position: candidate.position,
    title: candidate.title,
    description: candidate.description,
    place_id: candidate.place_id,
    place_name: candidate.place_name,
    image_url: candidate.image_url,
    image_alt: candidate.image_alt,
    external_url: candidate.external_url,
  };
}

function toGuideItemCreateRow(
  candidate: GuideItemImportCandidate,
  parent: GuideImportParent,
) {
  return {
    guide_id: parent.kind === "existing" ? parent.guideId : null,
    guide_ref: parent.kind === "new" ? parent.importRef : null,
    ...toGuideItemUpdateRow(candidate),
  };
}

export async function applyGuideImport(
  buffer: ArrayBuffer,
  guideFingerprints: ApplyFingerprints,
  itemFingerprints: ApplyFingerprints,
): Promise<GuideApplyResult> {
  const parseResult = await parseGuidesWorkbook(buffer);
  if (!parseResult.ok) {
    return { ok: false, kind: "invalid_file", error: parseResult.error };
  }

  const { guides: existingGuides, items: existingItems } =
    await listGuidesForExport();
  const preview = buildGuideImportPreview(
    parseResult.guideRows,
    parseResult.itemRows,
    existingGuides,
    existingItems,
  );

  if (preview.summary.guides.error > 0 || preview.summary.items.error > 0) {
    return { ok: false, kind: "validation_error", preview };
  }

  const conflicts: GuideApplyConflict[] = [];

  for (const row of preview.guides) {
    if (row.status !== "update") continue;
    const supplied = guideFingerprints[row.id];
    if (!supplied) {
      conflicts.push({
        entity: "guide",
        id: row.id,
        title: row.candidate.title,
        reason: "missing_fingerprint",
      });
    } else if (supplied !== row.baseFingerprint) {
      conflicts.push({
        entity: "guide",
        id: row.id,
        title: row.candidate.title,
        reason: "changed",
      });
    }
  }

  for (const row of preview.items) {
    if (row.status !== "update") continue;
    const supplied = itemFingerprints[row.id];
    if (!supplied) {
      conflicts.push({
        entity: "item",
        id: row.id,
        title: row.candidate.title,
        reason: "missing_fingerprint",
      });
    } else if (supplied !== row.baseFingerprint) {
      conflicts.push({
        entity: "item",
        id: row.id,
        title: row.candidate.title,
        reason: "changed",
      });
    }
  }

  if (conflicts.length > 0) {
    return { ok: false, kind: "stale_preview", conflicts };
  }

  const guideCreates = preview.guides.filter((r) => r.status === "create");
  const guideUpdates = preview.guides.filter((r) => r.status === "update");
  const itemCreates = preview.items.filter((r) => r.status === "create");
  const itemUpdates = preview.items.filter((r) => r.status === "update");

  if (
    guideCreates.length === 0 &&
    guideUpdates.length === 0 &&
    itemCreates.length === 0 &&
    itemUpdates.length === 0
  ) {
    return {
      ok: true,
      guides: { created: [], updated: [] },
      items: { created: [], updated: [] },
    };
  }

  const client = createAdminClient();
  const { data, error } = await client.rpc("apply_guide_import", {
    guide_creates: guideCreates.map((r) => ({
      import_ref: r.candidate.importRef,
      ...toGuideRow(r.candidate),
    })),
    guide_updates: guideUpdates.map((r) => ({
      id: r.id,
      ...toGuideRow(r.candidate),
    })),
    item_creates: itemCreates.map((r) =>
      toGuideItemCreateRow(r.candidate, r.parent),
    ),
    item_updates: itemUpdates.map((r) => ({
      id: r.id,
      ...toGuideItemUpdateRow(r.candidate),
    })),
  });

  if (error) {
    logger.error("admin.guides.import_apply_failed", {
      message: error.message,
    });
    return {
      ok: false,
      kind: "apply_failed",
      error: "Could not apply the import. No changes were made.",
    };
  }

  const createdGuideIds: string[] = Array.isArray(data?.created_guide_ids)
    ? data.created_guide_ids
    : [];
  const createdItemIds: string[] = Array.isArray(data?.created_item_ids)
    ? data.created_item_ids
    : [];

  return {
    ok: true,
    guides: {
      created: guideCreates.map((r, index) => ({
        id: createdGuideIds[index] ?? "",
        title: r.candidate.title,
      })),
      updated: guideUpdates.map((r) => ({
        id: r.id,
        title: r.candidate.title,
      })),
    },
    items: {
      created: itemCreates.map((r, index) => ({
        id: createdItemIds[index] ?? "",
        title: r.candidate.title,
      })),
      updated: itemUpdates.map((r) => ({ id: r.id, title: r.candidate.title })),
    },
  };
}
