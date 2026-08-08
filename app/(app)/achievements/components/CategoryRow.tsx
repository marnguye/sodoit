import { ChevronRight, LucideIcon } from "lucide-react";

export function CategoryRow({
  icon: Icon,
  accent,
  name,
  completed,
  total,
}: {
  icon: LucideIcon;
  accent: string;
  name: string;
  completed: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink">{name}</span>
          <span className="shrink-0 text-xs font-semibold text-muted">
            {completed} / {total}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: accent }}
          />
        </div>
      </div>

      <ChevronRight
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-border"
      />
    </li>
  );
}
