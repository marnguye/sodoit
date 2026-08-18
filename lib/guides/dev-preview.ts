import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import type { Guide, GuideItem, GuideWithItems } from "./types";

interface GuideSourceItem {
  position: number;
  title: string;
  description: string | null;
  place_name: string | null;
  image_url: string | null;
  image_alt: string | null;
  external_url: string | null;
}

interface GuideSource {
  slug: string;
  title: string;
  description: string | null;
  city: string;
  country_code: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  duration_label: string | null;
  is_public: boolean;
  featured: boolean;
  items: GuideSourceItem[];
}

const GUIDES_DIR = path.join(process.cwd(), "scripts", "content", "guides");

function assertDevelopment() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Guide preview data is development-only.");
  }
}

function createPreviewGuide(source: GuideSource): GuideWithItems {
  const timestamp = "1970-01-01T00:00:00.000Z";
  const guideId = `preview-${source.slug}`;

  const guide: Guide = {
    id: guideId,
    slug: source.slug,
    title: source.title,
    description: source.description,
    city: source.city,
    country_code: source.country_code,
    cover_image_url: source.cover_image_url,
    cover_image_alt: source.cover_image_alt,
    duration_label: source.duration_label,

    is_public: true,
    featured: source.slug === "48-hours-in-prague",

    created_at: timestamp,
    updated_at: timestamp,
  };

  const items: GuideItem[] = source.items.map((item) => ({
    id: `preview-${source.slug}-${item.position}`,
    guide_id: guideId,
    position: item.position,
    title: item.title,
    description: item.description,
    place_name: item.place_name,
    image_url: item.image_url,
    image_alt: item.image_alt,
    external_url: item.external_url,
    place_id: null,
    created_at: timestamp,
    updated_at: timestamp,
  }));

  return {
    ...guide,
    items,
  };
}

async function loadSources(): Promise<GuideSource[]> {
  assertDevelopment();

  let files: string[];
  try {
    files = (await readdir(GUIDES_DIR))
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  return Promise.all(
    files.map(async (file) => {
      const content = await readFile(path.join(GUIDES_DIR, file), "utf8");

      try {
        return JSON.parse(content) as GuideSource;
      } catch (error) {
        throw new Error(`Invalid Guide preview JSON in ${file}`, {
          cause: error,
        });
      }
    }),
  );
}

export async function getDevPreviewGuides(): Promise<Guide[]> {
  const sources = await loadSources();

  return sources.map(createPreviewGuide);
}

export async function getDevPreviewItemCounts(): Promise<
  Record<string, number>
> {
  const sources = await loadSources();
  const counts: Record<string, number> = {};
  for (const source of sources) {
    counts[`preview-${source.slug}`] = source.items.length;
  }
  return counts;
}

export async function getDevPreviewGuideBySlug(
  slug: string,
): Promise<GuideWithItems | null> {
  const sources = await loadSources();

  const source = sources.find((guide) => guide.slug === slug);

  return source ? createPreviewGuide(source) : null;
}
