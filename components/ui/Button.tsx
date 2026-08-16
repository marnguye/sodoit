import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:bg-accent/50",
  soft: "bg-accent-wash text-accent-dark",
  ghost: "bg-transparent text-secondary hover:bg-surface-subtle hover:text-ink",
  outline:
    "border border-border bg-surface text-ink hover:border-border-strong hover:bg-surface-subtle",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex cursor-pointer items-center justify-center gap-2",
        "rounded-control font-semibold",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
