import { formatCompactCount } from "@/lib/experiences/format";

interface ExperienceSocialProofProps {
  savedCount: number;
  variant?: "compact" | "full";
  className?: string;
}

export function ExperienceSocialProof({
  savedCount,
  variant = "compact",
  className = "",
}: ExperienceSocialProofProps) {
  if (savedCount <= 0) return null;

  const count = formatCompactCount(savedCount);
  const label =
    variant === "full"
      ? `${count} ${savedCount === 1 ? "person" : "people"} saved this`
      : `${count} saved`;

  return (
    <span className={["text-xs font-medium text-muted", className].join(" ")}>
      {label}
    </span>
  );
}
