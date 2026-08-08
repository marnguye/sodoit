import { CheckCircle2, Layers3, Trophy } from "lucide-react";
import { Card } from "@/components/ui";

export function ProfileStats({
  completed,
  categories,
  achievements,
}: {
  completed: number;
  categories: number;
  achievements: number;
}) {
  const stats = [
    { icon: CheckCircle2, label: "Completed", value: completed },
    { icon: Layers3, label: "Categories", value: categories },
    { icon: Trophy, label: "Achievements", value: achievements },
  ];

  return (
    <Card className="mt-6 divide-y divide-border p-0">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-lg font-bold leading-none text-ink">{value}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}
