"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Logo } from "../ui";

interface HeaderProps {
  signedIn: boolean;
  username?: string | null;
  avatarUrl?: string | null;
}

const NAV = [
  { href: "/", label: "Browse" },
  { href: "/discovery", label: "Discovery" },
  { href: "/feed", label: "Feed" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/browse";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ signedIn, username, avatarUrl }: HeaderProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-surface">
      <div className="relative mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Sodoit home"
          className="shrink-0 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <span className="sm:hidden">
            <Logo size="sm" />
          </span>

          <span className="hidden sm:block">
            <Logo size="md" />
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 flex h-full -translate-x-1/2 items-center gap-3 min-[430px]:gap-4 sm:gap-6 md:gap-8"
        >
          {NAV.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-full items-center text-sm font-semibold",
                  "outline-none transition-colors",
                  "focus-visible:text-accent",
                  active ? "text-ink" : "text-secondary hover:text-ink",
                ].join(" ")}
              >
                {item.label}

                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-0 bottom-0 h-0.5 rounded-pill bg-accent",
                    "transition-transform duration-200",
                    active ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        {!isAuthRoute &&
          (signedIn && username ? (
            <Link
              href={`/u/${username}`}
              aria-label="Your profile"
              className="ml-auto shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <Avatar name={username} src={avatarUrl} size="sm" />
            </Link>
          ) : !signedIn ? (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/login"
                className={[
                  "hidden h-10 items-center justify-center rounded-control px-3",
                  "text-sm font-semibold text-secondary transition-colors",
                  "hover:bg-surface-subtle hover:text-ink",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                  "min-[430px]:inline-flex",
                ].join(" ")}
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className={[
                  "inline-flex h-10 items-center justify-center rounded-control bg-accent px-4",
                  "text-sm font-semibold text-white transition-colors",
                  "hover:bg-accent-hover",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                ].join(" ")}
              >
                Sign up
              </Link>
            </div>
          ) : null)}
      </div>
    </header>
  );
}
