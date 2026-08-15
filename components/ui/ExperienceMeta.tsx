import type { Experience } from "@/lib/experiences/types";
import { Badge } from "./Badge";

export function experienceLocation(experience: Experience): string | null {
  if (experience.location_type === "city") return experience.city;
  if (experience.location_type === "country") return experience.country_code;
  return null;
}

interface ExperienceMetaProps {
  category: string | null;
  difficulty: string;
  location?: string | null;
  dimmed?: boolean;
  className?: string;
}

export function ExperienceMeta({
  category,
  difficulty,
  location,
  dimmed = false,
  className = "",
}: ExperienceMetaProps) {
  return (
    <div
      className={[
        "flex flex-wrap items-center gap-x-2 gap-y-1",
        dimmed ? "opacity-60" : "",
        className,
      ].join(" ")}
    >
      {category && <Badge variant="muted">{category}</Badge>}

      <span className="text-[11px] font-semibold text-muted">{difficulty}</span>

      {location && (
        <>
          <span aria-hidden="true" className="text-[11px] text-border-strong">
            •
          </span>
          <span className="truncate text-[11px] font-semibold text-muted">
            {location}
          </span>
        </>
      )}
    </div>
  );
}
