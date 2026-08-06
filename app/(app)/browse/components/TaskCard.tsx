import { Check, Users, Sparkles } from "lucide-react";
import type { Experience } from "../types";
import { hashString } from "../types";

const DIFFICULTIES = [
  { label: "Easy", xp: 10, color: "#16A34A" },
  { label: "Medium", xp: 25, color: "#F97316" },
  { label: "Hard", xp: 50, color: "#DC2626" },
];

const THUMBNAIL_HUES = ["#FED7AA", "#BAE6FD", "#BBF7D0", "#E9D5FF", "#FECACA"];

export function TaskCard({
  experience,
  done,
  onToggle,
}: {
  experience: Experience;
  done: boolean;
  onToggle: () => void;
}) {
  const hash = hashString(experience.id);
  const difficulty = DIFFICULTIES[hash % DIFFICULTIES.length];
  const thumbnail = THUMBNAIL_HUES[hash % THUMBNAIL_HUES.length];
  const adoption = 50 + (hash % 950);
  const completions = Math.floor(adoption * (0.2 + (hash % 50) / 100));

  return (
    <li className="flex items-center gap-4 p-3 rounded-xl hover:bg-card transition-colors">
      <div
        className="w-14 h-14 rounded-lg shrink-0"
        style={{ background: thumbnail }}
      />

      <button
        onClick={onToggle}
        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: done ? "#F97316" : "#78716C",
          background: done ? "#F97316" : "transparent",
        }}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate transition-colors ${
            done ? "text-muted line-through" : "text-ink"
          }`}
        >
          {experience.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {experience.category && (
            <span className="text-[11px] font-semibold text-muted bg-white border border-border rounded-full px-2 py-0.5">
              {experience.category}
            </span>
          )}
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: difficulty.color }}
          >
            <Sparkles className="w-3 h-3" />
            {difficulty.label} · {difficulty.xp} XP
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Users className="w-3 h-3" />
            {adoption} added · {completions} completed
          </span>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`h-9 px-4 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
          done
            ? "bg-accent-light text-accent-dark"
            : "bg-accent hover:bg-accent-dark text-white"
        }`}
      >
        {done ? "Added ✓" : "Add to My List"}
      </button>
    </li>
  );
}
