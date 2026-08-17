import type { ReactNode } from "react";

interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AdminFormSection({
  title,
  description,
  children,
}: AdminFormSectionProps) {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
