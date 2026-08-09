"use client";

import {
  CheckCircle2,
  Compass,
  HelpCircle,
  Lightbulb,
  LucideIcon,
} from "lucide-react";
import type { PostType } from "../../types";

interface TypeOption {
  type: PostType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const OPTIONS: TypeOption[] = [
  {
    type: "question",
    label: "Question",
    description: "Ask the community for advice or help.",
    icon: HelpCircle,
  },
  {
    type: "tip",
    label: "Tip",
    description: "Share something useful you learned.",
    icon: Lightbulb,
  },
  {
    type: "experience",
    label: "Experience",
    description: "Tell the story of something you did.",
    icon: Compass,
  },
];

interface PostTypeSelectorProps {
  value: PostType | null;
  onChange: (type: PostType) => void;
}

export function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Post type"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {OPTIONS.map(({ type, label, description, icon: Icon }, index) => {
        const selected = value === type;

        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            autoFocus={index === 0}
            onClick={() => onChange(type)}
            className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
              selected
                ? "border-accent bg-accent-light"
                : "border-border bg-white hover:border-accent/50"
            }`}
          >
            {selected && (
              <CheckCircle2
                aria-hidden="true"
                className="absolute right-3 top-3 h-4 w-4 text-accent"
              />
            )}
            <Icon
              className={`h-5 w-5 ${selected ? "text-accent" : "text-muted"}`}
            />
            <span
              className={`text-sm font-bold ${selected ? "text-accent-dark" : "text-ink"}`}
            >
              {label}
            </span>
            <span className="text-xs leading-snug text-muted">
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
