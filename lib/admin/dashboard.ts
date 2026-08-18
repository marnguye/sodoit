import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardMetrics {
  experiencesTotal: number;
  experiencesPublic: number;
  experiencesHidden: number;
  guidesTotal: number;
  guidesPublic: number;
  placesTotal: number;
  placesMissingCoordinates: number;
  experiencesWithoutImage: number;
  experiencesWithoutDescription: number;
  unpublishedGuides: number;
  recentExperiences: { id: string; title: string; created_at: string }[];
  recentGuides: { id: string; title: string; updated_at: string }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const client = createAdminClient();

  const [
    experiencesTotal,
    experiencesPublic,
    experiencesHidden,
    guidesTotal,
    guidesPublic,
    placesTotal,
    placesMissingCoordinates,
    experiencesWithoutImage,
    experiencesWithoutDescription,
    unpublishedGuides,
    recentExperiences,
    recentGuides,
  ] = await Promise.all([
    client.from("experiences").select("*", { count: "exact", head: true }),
    client
      .from("experiences")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    client
      .from("experiences")
      .select("*", { count: "exact", head: true })
      .eq("is_public", false),
    client.from("guides").select("*", { count: "exact", head: true }),
    client
      .from("guides")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    client.from("places").select("*", { count: "exact", head: true }),
    client
      .from("places")
      .select("*", { count: "exact", head: true })
      .is("latitude", null),
    client
      .from("experiences")
      .select("*", { count: "exact", head: true })
      .is("image_url", null),
    client
      .from("experiences")
      .select("*", { count: "exact", head: true })
      .or("description.is.null,description.eq."),
    client
      .from("guides")
      .select("*", { count: "exact", head: true })
      .eq("is_public", false),
    client
      .from("experiences")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    client
      .from("guides")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [
    experiencesTotal,
    experiencesPublic,
    experiencesHidden,
    guidesTotal,
    guidesPublic,
    placesTotal,
    placesMissingCoordinates,
    experiencesWithoutImage,
    experiencesWithoutDescription,
    unpublishedGuides,
    recentExperiences,
    recentGuides,
  ]) {
    if (result.error) throw result.error;
  }

  return {
    experiencesTotal: experiencesTotal.count ?? 0,
    experiencesPublic: experiencesPublic.count ?? 0,
    experiencesHidden: experiencesHidden.count ?? 0,
    guidesTotal: guidesTotal.count ?? 0,
    guidesPublic: guidesPublic.count ?? 0,
    placesTotal: placesTotal.count ?? 0,
    placesMissingCoordinates: placesMissingCoordinates.count ?? 0,
    experiencesWithoutImage: experiencesWithoutImage.count ?? 0,
    experiencesWithoutDescription: experiencesWithoutDescription.count ?? 0,
    unpublishedGuides: unpublishedGuides.count ?? 0,
    recentExperiences: recentExperiences.data ?? [],
    recentGuides: recentGuides.data ?? [],
  };
}
