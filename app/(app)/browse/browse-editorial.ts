import type { BrowseSort, Experience, StatusFilter } from "./types";

export function isDefaultBrowseView({
  q,
  category,
  difficulty,
  status,
  sort,
}: {
  q: string;
  category: string | null;
  difficulty: string | null;
  status: StatusFilter;
  sort: BrowseSort;
}): boolean {
  return (
    !q && !category && !difficulty && status === "all" && sort === "recommended"
  );
}

export interface SplitFeaturedResult {
  featured: Experience | null;
  rest: Experience[];
}

export function splitFeatured(
  experiences: Experience[],
  active: boolean,
): SplitFeaturedResult {
  if (!active) {
    return { featured: null, rest: experiences };
  }

  const featured = experiences.find((experience) => experience.featured);

  if (!featured) {
    return { featured: null, rest: experiences };
  }

  return {
    featured,
    rest: experiences.filter((experience) => experience.id !== featured.id),
  };
}
