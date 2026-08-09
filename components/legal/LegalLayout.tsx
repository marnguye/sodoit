import { ReactNode } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui";

const NAV_ITEMS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
] as const;

type LegalHref = (typeof NAV_ITEMS)[number]["href"];

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  active: LegalHref;
  children: ReactNode;
}

export function LegalLayout({
  title,
  subtitle,
  active,
  children,
}: LegalLayoutProps) {
  return (
    <PageShell title={title} subtitle={subtitle} maxWidth="960px">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-accent">
          Sodoit legal
        </span>
        <span className="text-border">·</span>
        <span className="text-muted">Last updated: August 2026</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <nav
          aria-label="Legal pages"
          className="flex gap-1 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:gap-0.5 lg:self-start lg:overflow-visible lg:pb-0"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === active;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-accent-light text-accent-dark"
                    : "text-muted hover:bg-border/30 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}
