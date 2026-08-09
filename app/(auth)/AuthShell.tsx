import Image from "next/image";
import Link from "next/link";
import { Compass, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";

const BENEFITS = [
  { icon: Compass, label: "Meaningful ideas" },
  { icon: TrendingUp, label: "Track progress" },
  { icon: Users, label: "Inspiring community" },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background lg:h-[calc(100dvh-64px)] lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center px-5 py-4 sm:px-6 lg:h-full lg:min-h-0 lg:px-8 lg:py-8">
        <div className="flex w-full overflow-hidden lg:bg-white lg:h-full lg:max-h-[760px] lg:min-h-[640px] lg:rounded-xl lg:border lg:border-border">
          {" "}
          <aside className="relative hidden w-1/2 overflow-hidden bg-accent-light lg:flex lg:flex-col">
            <div className="relative z-10 px-12 py-10 xl:px-14">
              <div className="mt-6">
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink">
                  Your life.
                  <br />
                  <span className="text-accent">Your list.</span>
                </h1>

                <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
                  Discover ideas, track progress and build a life you&apos;re
                  proud of.
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                  {BENEFITS.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 text-sm font-semibold text-ink"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="absolute inset-x-0 bottom-0 h-[38%]"
              aria-hidden="true"
            >
              <Image
                src="/auth/auth.jpg"
                alt=""
                fill
                sizes="640px"
                className="object-cover object-[center_60%]"
              />
            </div>
          </aside>
          <section className="flex w-full flex-col justify-center lg:w-1/2">
            <div className="mx-auto w-full max-w-[420px] lg:px-0">
              <div className="relative mb-8 h-[170px] w-full overflow-hidden rounded-lg sm:h-[190px] lg:hidden">
                <Image
                  src="/auth/auth.jpg"
                  alt="Hikers exploring coastal cliffs"
                  fill
                  priority
                  sizes="(max-width: 1023px) 420px"
                  className="object-cover object-[center_67%]"
                />
              </div>

              {children}

              <p className="mt-10 text-center text-xs leading-5 text-muted">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="font-medium text-ink transition-colors hover:text-accent"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-ink transition-colors hover:text-accent"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
