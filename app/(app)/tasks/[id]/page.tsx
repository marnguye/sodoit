import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ExperienceImage, ExperienceMeta } from "@/components/ui";
import { getTaskMeta, getDifficulty } from "@/app/(app)/browse/types";
import type { ListStatus } from "@/app/(app)/browse/types";
import { ActionPanel } from "./ActionPanel";

interface TaskRow {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  difficulty: string | null;
  image_url: string | null;
  image_alt: string | null;
}

interface SimilarExperience {
  id: string;
  title: string;
  category: string | null;
  difficulty: string | null;
}

const PRACTICAL_TIPS: readonly string[] = [
  "Block a fixed time on your calendar instead of waiting for motivation.",
  "Tell a friend you're doing this — accountability makes it stick.",
  "Break it into one small first step you can do today.",
  "Take a photo when you finish. It's optional, but future-you will thank you.",
];

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("experiences")
    .select(
      "id, title, category, description, difficulty, image_url, image_alt",
    )
    .eq("id", id)
    .single<TaskRow>();

  if (!task) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let status: ListStatus | null = null;
  let totalCompleted = 0;

  if (user) {
    const [{ data: mine }, { count }] = await Promise.all([
      supabase
        .from("user_lists")
        .select("status")
        .eq("user_id", user.id)
        .eq("experience_id", id)
        .maybeSingle<{ status: ListStatus }>(),
      supabase
        .from("user_lists")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);
    status = mine?.status ?? null;
    totalCompleted = count ?? 0;
  }

  const { data: similar } = task.category
    ? await supabase
        .from("experiences")
        .select("id, title, category, difficulty")
        .eq("is_public", true)
        .eq("category", task.category)
        .neq("id", task.id)
        .limit(3)
    : { data: [] as SimilarExperience[] };

  const { thumbnail } = getTaskMeta(task.id);
  const difficulty = getDifficulty(task.id, task.difficulty);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-control text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="mt-4 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <header className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
          <ExperienceImage
            title={task.title}
            imageUrl={task.image_url}
            imageAlt={task.image_alt}
            fallbackColor={thumbnail}
            className="aspect-[16/9] w-full rounded-media"
            sizes="(min-width: 1024px) 800px, 100vw"
            priority
          />

          <ExperienceMeta
            className="mt-4"
            category={task.category}
            difficulty={difficulty.label}
          />

          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-ink sm:text-3xl">
            {task.title}
          </h1>
        </header>

        <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
          <ActionPanel
            taskId={task.id}
            taskTitle={task.title}
            initialStatus={status}
            signedIn={!!user}
            totalCompleted={totalCompleted}
          />
        </div>

        <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
          <section>
            <h2 className="text-base font-bold tracking-[-0.01em] text-ink">
              About this experience
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              {task.description ||
                "No description yet — just a good idea worth doing."}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold tracking-[-0.01em] text-ink">
              Practical tips
            </h2>
            <ul className="mt-3 flex max-w-2xl flex-col gap-2.5">
              {PRACTICAL_TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2.5 text-sm leading-6 text-secondary"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          {similar && similar.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-bold tracking-[-0.01em] text-ink">
                Related experiences
              </h2>

              <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {similar.map((item) => {
                  const itemDifficulty = getDifficulty(item.id, item.difficulty);

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/tasks/${item.id}`}
                        className="flex h-full flex-col gap-2 rounded-card border border-border bg-surface p-3.5 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                      >
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink">
                          {item.title}
                        </p>

                        <ExperienceMeta
                          className="mt-auto"
                          category={item.category}
                          difficulty={itemDifficulty.label}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
