interface BrowseProgressProps {
  completedCount: number;
}

export function BrowseProgress({ completedCount }: BrowseProgressProps) {
  return (
    <p className="text-xs text-muted">
      <span className="font-semibold text-ink">{completedCount}</span>{" "}
      experience{completedCount === 1 ? "" : "s"} completed
    </p>
  );
}
