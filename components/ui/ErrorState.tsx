interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
