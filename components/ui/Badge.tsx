import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-surface-subtle text-secondary",
  accent: "bg-accent-wash text-accent-dark",
  success: "bg-success-light text-success",
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
  muted: "bg-surface-subtle text-muted",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2.5 py-0.5",
        "text-[11px] font-semibold leading-5",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
