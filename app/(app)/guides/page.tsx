import { redirect } from "next/navigation";

interface GuidesPageProps {
  searchParams: Promise<{ city?: string; q?: string }>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const { city, q } = await searchParams;

  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (q) params.set("q", q);

  const qs = params.toString();
  redirect(qs ? `/discovery?${qs}` : "/discovery");
}
