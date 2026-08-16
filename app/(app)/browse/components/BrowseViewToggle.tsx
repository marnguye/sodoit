import { LayoutGrid, List } from "lucide-react";
import type { BrowseView } from "../types";

interface BrowseViewToggleProps {
  view: BrowseView;
  onChange: (view: BrowseView) => void;
}

const OPTIONS: {
  view: BrowseView;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { view: "grid", label: "Grid view", icon: LayoutGrid },
  { view: "list", label: "List view", icon: List },
];

export function BrowseViewToggle({ view, onChange }: BrowseViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Layout"
      className="flex h-8 shrink-0 items-center gap-0.5 rounded-control border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ view: optionView, label, icon: Icon }) => {
        const selected = optionView === view;

        return (
          <button
            key={optionView}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            onClick={() => onChange(optionView)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-md",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              selected
                ? "bg-ink text-white"
                : "text-secondary hover:bg-surface-subtle hover:text-ink",
            ].join(" ")}
          >
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
