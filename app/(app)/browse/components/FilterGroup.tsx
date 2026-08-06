const FILTER_BUTTON_CLASS =
  "px-3 rounded-full text-xs font-semibold transition-colors";
const ACTIVE_FILTER_CLASS = "bg-accent text-white";

interface FilterGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className: string;
  buttonClassName: string;
  inactiveClassName: string;
}

export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  buttonClassName,
  inactiveClassName,
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
            aria-current={selected ? "true" : undefined}
            className={`${FILTER_BUTTON_CLASS} ${buttonClassName} ${selected ? ACTIVE_FILTER_CLASS : inactiveClassName}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
