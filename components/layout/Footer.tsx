import Link from "next/link";
import { Logo } from "@/components/ui";

const COLUMNS = [
  {
    heading: "Sodoit",
    links: [
      { href: "/", label: "Browse" },
      { href: "/feed", label: "Feed" },
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
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <Logo size="md" />
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-muted">
              Real-life experiences. Build your list. Go do them.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {column.heading}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-[13px] text-muted">
          © 2026 Sodoit
        </div>
      </div>
    </footer>
  );
}
