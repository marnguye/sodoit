import { Sparkles } from "lucide-react";

import { BrowseSignupCta } from "./BrowseSignupCta";
import { BROWSE_STEPS } from "./browseSteps";

export function BrowseSidebar() {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      <section className="rounded-panel border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent-dark">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink">How Sodoit works</h2>

            <p className="mt-1 text-sm leading-5 text-secondary">
              Find something worth doing, save it, and make it happen.
            </p>
          </div>
        </div>

        <div className="relative mt-6">
          <div
            aria-hidden="true"
            className="absolute bottom-5 left-[17px] top-5 w-px bg-border"
          />

          <div className="relative flex flex-col gap-6">
            {BROWSE_STEPS.map(({ number, icon: Icon, title, description }) => (
              <div key={number} className="flex items-start gap-3">
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-wash text-[11px] font-bold text-accent-dark">
                  {number}
                </div>

                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 text-accent-dark"
                    />

                    <p className="text-sm font-semibold text-ink">{title}</p>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-secondary">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrowseSignupCta />
    </div>
  );
}
