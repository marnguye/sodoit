import type { BrowseView, Experience } from "../types";
import { ExperienceResults } from "./ExperienceResults";

interface ExperienceSectionProps {
  title: string;
  experiences: Experience[];
  completed: Set<string>;
  onToggle: (id: string) => Promise<void>;
  guest: boolean;
  onGuestSave: () => void;
  view: BrowseView;
}

export function ExperienceSection({
  title,
  experiences,
  completed,
  onToggle,
  guest,
  onGuestSave,
  view,
}: ExperienceSectionProps) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-base font-bold tracking-[-0.01em] text-ink">
        {title}
      </h2>

      <ExperienceResults
        experiences={experiences}
        view={view}
        completed={completed}
        onToggle={onToggle}
        guest={guest}
        onGuestSave={onGuestSave}
      />
    </section>
  );
}
