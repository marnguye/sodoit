import { Fragment, type ReactNode } from "react";

import type { BrowseView, Experience } from "../types";
import { ExperienceCard } from "./ExperienceCard";
import { TaskRow } from "./TaskRow";

interface ExperienceResultsProps {
  experiences: Experience[];
  view: BrowseView;
  completed: Set<string>;
  onToggle: (id: string) => Promise<void>;
  onRemove?: (id: string) => void;
  removeLabel?: string;
  onManageCollections?: (id: string) => void;
  guest?: boolean;
  onGuestSave?: () => void;
  inlineContent?: ReactNode;
  inlineAfter?: number;
}

export function ExperienceResults({
  experiences,
  view,
  completed,
  onToggle,
  onRemove,
  removeLabel,
  onManageCollections,
  guest = false,
  onGuestSave = () => {},
  inlineContent,
  inlineAfter = 6,
}: ExperienceResultsProps) {
  const isGrid = view === "grid";

  const items = experiences.map((experience, index) => {
    const shared = {
      experience,
      done: completed.has(experience.id),
      onToggle: () => onToggle(experience.id),
      guest,
      onGuestSave,
      onRemove: onRemove ? () => onRemove(experience.id) : undefined,
      removeLabel,
      onManageCollections: onManageCollections
        ? () => onManageCollections(experience.id)
        : undefined,
    };

    return (
      <Fragment key={experience.id}>
        {isGrid ? <ExperienceCard {...shared} /> : <TaskRow {...shared} />}

        {inlineContent && index === inlineAfter - 1 && (
          <li className="col-span-full py-3 lg:hidden">{inlineContent}</li>
        )}
      </Fragment>
    );
  });

  if (isGrid) {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items}
      </ul>
    );
  }

  return <ul className="divide-y divide-border">{items}</ul>;
}
