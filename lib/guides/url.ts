export interface GuidesQuery {
  city?: string;
  q?: string;
  duration?: string;
  featured?: string;
}

export function guidesUrl(params: GuidesQuery): string {
  const search = new URLSearchParams();
  if (params.city) search.set("city", params.city);
  if (params.q) search.set("q", params.q);
  if (params.duration) search.set("duration", params.duration);
  if (params.featured) search.set("featured", params.featured);

  const qs = search.toString();
  return qs ? `/guides?${qs}` : "/guides";
}
