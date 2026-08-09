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
    <header className="h-16 border-b border-border bg-surface">
      <div className="relative flex h-full w-full items-center px-4 sm:px-6">
        <Link href="/" aria-label="Sodoit home" className="shrink-0">
          <Logo size="md" />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-8 md:flex"
        >
          {NAV.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-full items-center text-sm font-semibold transition-colors",
                  "outline-none focus-visible:text-accent",
                  active ? "text-accent" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}

                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent transition-transform duration-200",
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
              className="ml-auto shrink-0 rounded-full transition-opacity hover:opacity-80"
            >
              <Avatar name={username} src={avatarUrl} size="sm" />
            </Link>
          ) : !signedIn ? (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Sign up
              </Link>
            </div>
          ) : null)}
      </div>
    </header>
  );
}
