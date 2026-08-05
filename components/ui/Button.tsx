import { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  ghost: "bg-transparent text-muted hover:bg-border/50",
  outline: "border border-border bg-transparent text-ink hover:bg-border/30",
} as const;

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={`rounded-md font-semibold cursor-pointer transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
