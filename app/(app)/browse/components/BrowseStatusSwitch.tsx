import type { StatusFilter } from "../types";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "uncompleted", label: "To do" },
  { value: "completed", label: "Done" },
];

interface BrowseStatusSwitchProps {
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}

export function BrowseStatusSwitch({
  status,
  onStatusChange,
}: BrowseStatusSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Completion status"
      className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-control border border-border bg-surface p-0.5"
    >
      {STATUS_OPTIONS.map(({ value, label }) => {
        const selected = value === status;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => onStatusChange(value)}
            className={[
              "inline-flex h-7 items-center justify-center rounded-md px-3",
              "text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              selected
                ? "bg-ink text-white"
                : "text-secondary hover:bg-surface-subtle hover:text-ink",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
