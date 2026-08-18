import type { ReactNode } from "react";

export const ADMIN_INPUT_CLASS =
  "w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors hover:border-border-strong focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10";

interface AdminFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}

export function AdminField({
  label,
  htmlFor,
  hint,
  full = false,
  children,
}: AdminFieldProps) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-ink"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
