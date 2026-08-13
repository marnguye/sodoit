const BASE_CLASS =
  "h-8 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

interface FilterGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  variant?: "chips" | "segmented";
  getLabel?: (option: T) => string;
}

export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className = "",
  variant = "chips",
  getLabel = (option) => option,
}: FilterGroupProps<T>) {
  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label={label}
        className={[
          "grid w-full min-w-0 grid-cols-3 gap-1",
          "rounded-control border border-border bg-surface p-1",
          className,
        ].join(" ")}
      >
        {options.map((option) => {
          const selected = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={[
                BASE_CLASS,
                "flex w-full min-w-0 items-center justify-center",
                "overflow-hidden whitespace-nowrap rounded-control px-2 text-center",
                selected
                  ? "bg-ink text-white"
                  : "text-secondary hover:bg-surface-subtle hover:text-ink",
              ].join(" ")}
            >
              {getLabel(option)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center gap-1 ${className}`}
    >
      {options.map((option) => {
        const selected = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={[
              BASE_CLASS,
              "shrink-0 rounded-control border px-3.5",
              selected
                ? "border-accent/40 bg-accent-wash text-accent-dark"
                : "border-border bg-surface text-secondary hover:border-border-strong hover:text-ink",
            ].join(" ")}
          >
            {getLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
