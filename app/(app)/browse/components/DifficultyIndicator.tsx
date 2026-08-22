import { getDifficultyPresentation } from "../types";

const TONE_FILL: Record<string, string> = {
  positive: "bg-success",
  caution: "bg-warning",
  warning: "bg-accent",
  critical: "bg-danger",
};

const TONE_LABEL: Record<string, string> = {
  critical: "font-semibold text-danger",
};

const BAR_COUNT = 4;

interface DifficultyIndicatorProps {
  difficulty: string | null;
  className?: string;
}

export function DifficultyIndicator({
  difficulty,
  className = "",
}: DifficultyIndicatorProps) {
  const presentation = getDifficultyPresentation(difficulty);

  if (!presentation) return null;

  const fill = TONE_FILL[presentation.tone] ?? "bg-subtle";

  return (
    <span
      className={["inline-flex items-center gap-1.5", className].join(" ")}
      aria-label={`Difficulty: ${presentation.label}`}
    >
      <span
        aria-hidden="true"
        className={[
          "font-medium text-muted",
          TONE_LABEL[presentation.tone] ?? "",
        ].join(" ")}
      >
        {presentation.label}
      </span>

      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <span
            key={index}
            className={[
              "h-2.5 w-1 rounded-full",
              index < presentation.level ? fill : "bg-border",
            ].join(" ")}
          />
        ))}
      </span>
    </span>
  );
}
