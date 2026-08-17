import { Badge } from "@/components/ui";

type Tone = "published" | "hidden" | "featured" | "type";

const TONE_VARIANT = {
  published: "success",
  hidden: "muted",
  featured: "accent",
  type: "default",
} as const;

interface AdminStatusBadgeProps {
  tone: Tone;
  children: React.ReactNode;
}

export function AdminStatusBadge({ tone, children }: AdminStatusBadgeProps) {
  return <Badge variant={TONE_VARIANT[tone]}>{children}</Badge>;
}
