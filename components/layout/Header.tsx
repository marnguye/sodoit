"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui";

const NAV_ITEMS = [
  { href: "/browse", label: "Browse" },
  { href: "/list", label: "My List" },
  { href: "/feed", label: "Feed" },
  { href: "/achievements", label: "Achievements" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center px-5 lg:px-8">
        <Link
          href="/"
          aria-label="Sodoit home"
          className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Logo size="lg" />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative flex h-full items-center text-sm font-semibold transition-colors",
                  "outline-none focus-visible:text-accent",
                  isActive ? "text-accent" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}

                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent transition-transform duration-200",
                    isActive ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
