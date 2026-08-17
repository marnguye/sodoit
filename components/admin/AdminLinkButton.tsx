import Link from "next/link";
import type { ComponentProps } from "react";

const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  outline:
    "border border-border bg-surface text-ink hover:border-border-strong hover:bg-surface-subtle",
} as const;

interface AdminLinkButtonProps extends ComponentProps<typeof Link> {
  variant?: keyof typeof VARIANTS;
}

export function AdminLinkButton({
  variant = "primary",
  className = "",
  ...props
}: AdminLinkButtonProps) {
  return (
    <Link
      className={[
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-control px-3.5 text-sm font-semibold transition-colors",
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
