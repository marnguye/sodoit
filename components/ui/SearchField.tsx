import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export function SearchField({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <label className={`relative flex-1 ${className}`}>
      <span className="sr-only">Search marketplace</span>
      <Search
        aria-hidden="true"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search the marketplace..."
        aria-keyshortcuts="Meta+K Control+K"
        className="w-full h-10 border border-border rounded-md pl-9 pr-3.5 sm:pr-16 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      />
      <kbd
        aria-hidden="true"
        className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted bg-background border border-border rounded px-1.5 py-0.5"
      >
        ⌘ K
      </kbd>
    </label>
  );
}
