import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { GuideCover } from "@/components/guides/GuideCover";
import { GuideItinerary } from "@/components/guides/GuideItinerary";
import { ShareGuideButton } from "@/components/guides/ShareGuideButton";
import { getGuideBySlug } from "@/lib/guides/queries";

const loadGuide = cache(async (slug: string) => {
  const guide = await getGuideBySlug(slug);
  if (guide || process.env.NODE_ENV !== "development") return guide;

  const { getDevPreviewGuideBySlug } = await import("@/lib/guides/dev-preview");
  return getDevPreviewGuideBySlug(slug);
});

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await loadGuide(slug);

  if (!guide) {
    return {
      title: "Guide not found | Sodoit",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${guide.title} | Sodoit`,
    description:
      guide.description ?? `A curated Sodoit guide to ${guide.city}.`,
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await loadGuide(slug);

  if (!guide) notFound();

  return (
    <article className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Back to guides
      </Link>

      <header className="mt-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-dark">
          {guide.city}
          {guide.duration_label ? ` · ${guide.duration_label}` : ""}
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {guide.title}
        </h1>

        {guide.description && (
          <p className="mt-3 text-base leading-relaxed text-secondary sm:text-lg">
            {guide.description}
          </p>
        )}
      </header>

      <div className="mt-6 grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <GuideCover
            imageUrl={guide.cover_image_url}
            imageAlt={guide.cover_image_alt}
            title={guide.title}
            priority
            sizes="(min-width: 1200px) 828px, (min-width: 1024px) calc(100vw - 372px), 100vw"
            className="aspect-[16/9] w-full rounded-media sm:max-h-[300px]"
          />

          <div className="mt-8 sm:mt-9">
            <GuideItinerary items={guide.items} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-panel border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Guide summary
            </p>

            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">City</dt>
                <dd className="font-semibold text-ink">{guide.city}</dd>
              </div>

              {guide.duration_label && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Duration</dt>
                  <dd className="font-semibold text-ink">
                    {guide.duration_label}
                  </dd>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Stops</dt>
                <dd className="font-semibold text-ink">{guide.items.length}</dd>
              </div>
            </dl>

            <ShareGuideButton title={guide.title} className="mt-5 w-full" />

            {guide.items.length > 0 && (
              <a
                href="#itinerary"
                className="mt-3 block rounded-sm text-center text-sm font-semibold text-accent-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                View itinerary ↓
              </a>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
