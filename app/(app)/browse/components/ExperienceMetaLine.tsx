import { MapPin } from "lucide-react";
import { getDifficultyPresentation } from "../types";
import { DifficultyIndicator } from "./DifficultyIndicator";

interface ExperienceMetaLineProps {
  location: string | null;
  difficulty: string | null;
  category?: string | null;
  showCategory?: boolean;
  size?: "xs" | "sm";
  className?: string;
}

export function ExperienceMetaLine({
  location,
  difficulty,
  category,
  showCategory = false,
  size = "xs",
  className = "",
}: ExperienceMetaLineProps) {
  const hasDifficulty = Boolean(getDifficultyPresentation(difficulty));
  const showCategoryText = showCategory && Boolean(category);

  if (!location && !hasDifficulty && !showCategoryText) {
    return null;
  }

  const textSize = size === "sm" ? "text-sm" : "text-xs";

  return (
    <div
      className={[
        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1",
        textSize,
        className,
      ].join(" ")}
    >
      {location && (
        <span className="inline-flex min-w-0 items-center gap-1 font-medium text-muted">
          <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
          <span className="truncate">{location}</span>
        </span>
      )}

      {location && hasDifficulty && (
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
      )}

      <DifficultyIndicator difficulty={difficulty} />

      {showCategoryText && (
        <>
          <span aria-hidden="true" className="text-border-strong">
            ·
          </span>
          <span className="truncate font-medium text-muted">{category}</span>
        </>
      )}
    </div>
  );
}
