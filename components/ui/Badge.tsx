import { HTMLAttributes } from "react";

const variants = {
  default: "bg-border text-ink",
  accent: "bg-accent-light text-accent-dark",
  success: "bg-success-light text-success",
  muted: "bg-border text-muted",
} as const;

export function Badge({
  variant = "default",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`inline-block rounded-full text-[11px] font-semibold px-[10px] py-[2px] ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
