import Link from "next/link";
import { Logo } from "@/components/ui";

const COLUMNS = [
  {
    heading: "Sodoit",
    links: [
      { href: "/", label: "Browse" },
      { href: "/feed", label: "Feed" },
      { href: "/guides", label: "Guides" },
      { href: "/trips", label: "Open Trips" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
  {
    heading: "Support",
    links: [{ href: "/contact", label: "Contact" }],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <Logo size="md" />

            <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-secondary">
              Made out of boredom, built for real life. Stop scrolling and build
              your list.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {column.heading}
              </p>

              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© 2026 Sodoit. All rights reserved.</p>
          <p className="text-xs text-secondary">Build your list. So do it.</p>
        </div>
      </div>
    </footer>
  );
}
