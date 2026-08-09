import type { Experience } from "../types";
import { TaskRow } from "./TaskRow";

interface ExperienceSectionProps {
  title: string;
  experiences: Experience[];
  completed: Set<string>;
  onToggle: (id: string) => Promise<void>;
  guest: boolean;
  onGuestSave: () => void;
  layout?: "list" | "grid";
}

export function ExperienceSection({
  title,
  experiences,
  completed,
  onToggle,
  guest,
  onGuestSave,
  layout = "list",
}: ExperienceSectionProps) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-bold text-ink">{title}</h2>

      <ul
        className={
          layout === "grid"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "divide-y divide-border"
        }
      >
        {experiences.map((experience) => (
          <TaskRow
            key={experience.id}
            experience={experience}
            done={completed.has(experience.id)}
            onToggle={() => onToggle(experience.id)}
            guest={guest}
            onGuestSave={onGuestSave}
            className={layout === "grid" ? "border border-border" : ""}
          />
        ))}
      </ul>
    </section>
  );
}
