export interface DiscoveryQuery {
  city?: string;
  q?: string;
  category?: string;
}

export function discoveryUrl(params: DiscoveryQuery): string {
  const search = new URLSearchParams();
  if (params.city) search.set("city", params.city);
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);

  const qs = search.toString();
  return qs ? `/discovery?${qs}` : "/discovery";
}
