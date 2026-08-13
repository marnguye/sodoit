"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  Bookmark,
  CheckCircle2,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Discover",
    description: "Find experiences and ideas worth trying.",
  },
  {
    icon: Bookmark,
    title: "Save",
    description: "Build your personal list of things to do.",
  },
  {
    icon: CheckCircle2,
    title: "Do",
    description: "Complete experiences in the real world.",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Share what you learned with the community.",
  },
];

export function BrowseSidebar() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-20">
      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-base font-bold text-ink">How it works</h2>

        <div className="mt-5 flex flex-col gap-5">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent-dark">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-secondary">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border bg-accent-wash p-5">
        <p className="text-lg font-bold leading-6 text-ink">
          Your life.
          <br />
          Your list.
        </p>

        <p className="mt-2 text-sm leading-6 text-secondary">
          Create your own list and start keeping track of the things you
          actually want to do.
        </p>

        <Button
          type="button"
          onClick={() => router.push("/signup")}
          className="mt-5 w-full"
        >
          Create your list
        </Button>
      </section>
    </div>
  );
}
