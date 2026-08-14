import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock3, ListOrdered, MapPin } from "lucide-react";

import { GuideCover } from "@/components/guides/GuideCover";
import { GuideItinerary } from "@/components/guides/GuideItinerary";
import { ShareGuideButton } from "@/components/guides/ShareGuideButton";
import { getGuideBySlug } from "@/lib/guides/queries";

const loadGuide = cache(async (slug: string) => {
  const guide = await getGuideBySlug(slug);

  if (guide || process.env.NODE_ENV !== "development") {
    return guide;
  }

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
      robots: {
        index: false,
        follow: false,
      },
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

  if (!guide) {
    notFound();
  }

  const isCollection = guide.type === "collection";
  const stopWord = isCollection ? "places" : "stops";
  const stopWordCapitalized = isCollection ? "Places" : "Stops";

  return (
    <article className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/discovery"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Back to Discovery
      </Link>

      <div
        className={[
          "mt-8 grid grid-cols-1 gap-8",
          "[grid-template-areas:'header'_'summary'_'itinerary']",
          "lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10",
          "lg:[grid-template-areas:'header_summary'_'itinerary_summary']",
        ].join(" ")}
      >
        <div className="min-w-0 [grid-area:header]">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              <span className="inline-flex items-center gap-1 text-accent-dark">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                {guide.city}
              </span>

              {guide.duration_label && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{guide.duration_label}</span>
                </>
              )}

              <span aria-hidden="true">·</span>

              <span>
                {guide.items.length} {stopWord}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl lg:text-5xl">
              {guide.title}
            </h1>

            {guide.description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
                {guide.description}
              </p>
            )}
          </header>

          <GuideCover
            imageUrl={guide.cover_image_url}
            imageAlt={guide.cover_image_alt}
            title={guide.title}
            priority
            sizes="(min-width: 1200px) 810px, (min-width: 1024px) calc(100vw - 390px), 100vw"
            className="mt-7 aspect-[16/9] w-full rounded-media object-cover"
          />
        </div>

        {guide.items.length > 0 && (
          <section
            id="itinerary"
            className="min-w-0 [grid-area:itinerary] scroll-mt-24"
          >
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Explore
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
                  {isCollection ? "Explore this collection" : "Your itinerary"}
                </h2>
              </div>

              <span className="shrink-0 text-sm text-muted">
                {guide.items.length} {stopWord}
              </span>
            </div>

            <GuideItinerary items={guide.items} />
          </section>
        )}

        <aside className="[grid-area:summary] lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-border bg-surface p-5">
            <h2 className="text-base font-bold text-ink">Guide summary</h2>

            <dl className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-secondary">
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <dt className="text-sm text-secondary">City</dt>
                  <dd className="text-sm font-semibold text-ink">
                    {guide.city}
                  </dd>
                </div>
              </div>

              {guide.duration_label && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-secondary">
                    <Clock3 aria-hidden="true" className="h-4 w-4" />
                  </div>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <dt className="text-sm text-secondary">Duration</dt>
                    <dd className="text-sm font-semibold text-ink">
                      {guide.duration_label}
                    </dd>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-secondary">
                  <ListOrdered aria-hidden="true" className="h-4 w-4" />
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <dt className="text-sm text-secondary">
                    {stopWordCapitalized}
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {guide.items.length}
                  </dd>
                </div>
              </div>
            </dl>

            {guide.items.length > 0 && (
              <a
                href="#itinerary"
                className="mt-6 flex h-10 w-full items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                {isCollection ? "View places ↓" : "View itinerary ↓"}
              </a>
            )}

            <ShareGuideButton title={guide.title} className="mt-2 w-full" />
          </div>
        </aside>
      </div>
    </article>
  );
}
