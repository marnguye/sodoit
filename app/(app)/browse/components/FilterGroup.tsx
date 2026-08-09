const BASE_CLASS =
  "flex h-8 shrink-0 items-center rounded-md border px-3 text-xs font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";
const ACTIVE_CLASS = "border-accent bg-accent text-white";
const INACTIVE_CLASS =
  "border-border bg-white text-muted hover:border-ink/20 hover:text-ink";

interface FilterGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className = "flex flex-wrap gap-2",
}: FilterGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={className}>
      {options.map((option) => {
        const selected = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={`${BASE_CLASS} ${selected ? ACTIVE_CLASS : INACTIVE_CLASS}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
