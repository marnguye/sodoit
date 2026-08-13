import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Guide, GuideItem, GuideWithItems } from "./types";

const GUIDE_COLUMNS =
  "id, slug, title, description, city, country_code, cover_image_url, cover_image_alt, duration_label, is_public, featured, created_at, updated_at";
const ITEM_COLUMNS =
  "id, guide_id, position, title, description, place_name, image_url, image_alt, external_url, created_at, updated_at";

async function loadGuides(featuredOnly: boolean): Promise<Guide[]> {
  const supabase = await createClient();
  let query = supabase
    .from("guides")
    .select(GUIDE_COLUMNS)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .order("slug");
  if (featuredOnly) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Guide[];
}

export function getPublicGuides(): Promise<Guide[]> {
  return loadGuides(false);
}

export function getFeaturedGuides(): Promise<Guide[]> {
  return loadGuides(true);
}

export async function getGuideItemCounts(
  guideIds: string[],
): Promise<Record<string, number>> {
  if (guideIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guide_items")
    .select("guide_id")
    .in("guide_id", guideIds);
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.guide_id] = (counts[row.guide_id] ?? 0) + 1;
  }
  return counts;
}

export async function getGuideBySlug(
  slug: string,
): Promise<GuideWithItems | null> {
  const supabase = await createClient();
  const guide = await supabase
    .from("guides")
    .select(GUIDE_COLUMNS)
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (guide.error) throw guide.error;
  if (!guide.data) return null;

  const items = await supabase
    .from("guide_items")
    .select(ITEM_COLUMNS)
    .eq("guide_id", guide.data.id)
    .order("position");
  if (items.error) throw items.error;

  return {
    ...(guide.data as Guide),
    items: (items.data ?? []) as GuideItem[],
  };
}
