import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Experience } from "@/lib/experiences/types";

const EXPERIENCE_COLUMNS =
  "id, title, slug, description, category, city, country_code, image_url, image_alt";

export async function getDiscoveryExperiences(
  limit = 6,
): Promise<Experience[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Experience[];
}
