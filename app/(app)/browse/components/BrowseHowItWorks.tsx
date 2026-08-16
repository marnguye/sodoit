import { BROWSE_STEPS } from "./browseSteps";

export function BrowseHowItWorks() {
  return (
    <section className="rounded-panel border border-border bg-surface p-4">
      <h2 className="text-sm font-bold text-ink">How Sodoit works</h2>

      <ol className="mt-3 flex flex-col gap-3">
        {BROWSE_STEPS.map(({ number, title, description }) => (
          <li key={number} className="flex items-start gap-3">
            <span className="mt-0.5 text-[11px] font-bold text-accent-dark">
              {number}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-secondary">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
