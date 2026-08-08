import { HTMLAttributes } from "react";

const variants = {
  default: "bg-border text-ink",
  accent: "bg-accent-light text-accent-dark",
  success: "bg-success-light text-success",
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
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
