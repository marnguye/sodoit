import { Lock } from "lucide-react";
import { Card } from "@/components/ui";
import type { MilestoneDef } from "../data";

interface MilestoneCardProps {
  milestone: MilestoneDef;
  current: number;
  earned: boolean;
}

export function MilestoneCard({
  milestone,
  current,
  earned,
}: MilestoneCardProps) {
  const Icon = milestone.icon;

  const progress = Math.min(current, milestone.target);
  const percent =
    milestone.target > 0 ? Math.round((progress / milestone.target) * 100) : 0;

  return (
    <Card
      className={`flex flex-col gap-3 transition-colors ${
        earned ? "border-accent/40" : ""
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          earned ? "bg-accent-light text-accent-dark" : "bg-border text-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-bold ${
              earned ? "text-ink" : "text-muted"
            }`}
          >
            {milestone.title}
          </p>

          {!earned && (
            <Lock aria-label="Locked" className="h-3.5 w-3.5 text-muted" />
          )}
        </div>

        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {milestone.description}
        </p>
      </div>

      {earned ? (
        <span className="w-fit rounded-full bg-accent-light px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
          Earned
        </span>
      ) : (
        <div className="mt-auto">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-1.5 text-xs font-semibold text-muted">
            {progress} / {milestone.target}
          </p>
        </div>
      )}
    </Card>
  );
}
