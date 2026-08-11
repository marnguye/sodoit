import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, ExperienceImage } from "@/components/ui";
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="mt-3 sm:mt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6 items-start">
        <ExperienceImage
          title={task.title}
          imageUrl={task.image_url}
          imageAlt={task.image_alt}
          fallbackColor={thumbnail}
          className="order-1 lg:order-none lg:col-start-1 lg:row-start-1 h-[200px] sm:h-[320px] lg:h-[360px] rounded-xl"
          sizes="(min-width: 1024px) 800px, 100vw"
        />

        <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {task.category && <Badge variant="accent">{task.category}</Badge>}
            <span
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: difficulty.color }}
            >
              <Sparkles className="h-3 w-3" />
              {difficulty.label}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-ink">
            {task.title}
          </h1>

          <ActionPanel
            taskId={task.id}
            taskTitle={task.title}
            initialStatus={status}
            signedIn={!!user}
            totalCompleted={totalCompleted}
          />
        </div>

        <Card className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 flex flex-col gap-5 p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-bold text-ink">
              About this experience
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {task.description ||
                "No description yet — just a good idea worth doing."}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">Practical tips</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {PRACTICAL_TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {similar && similar.length > 0 && (
          <div className="order-4 lg:order-none lg:col-start-1 lg:row-start-3">
            <h2 className="text-sm font-bold text-ink">Similar tasks</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similar.map((item) => {
                const itemDifficulty = getDifficulty(item.id, item.difficulty);
                return (
                  <Link key={item.id} href={`/tasks/${item.id}`}>
                    <Card className="h-full flex flex-col gap-2 p-4 hover:border-accent transition-colors">
                      {item.category && (
                        <Badge variant="accent" className="self-start">
                          {item.category}
                        </Badge>
                      )}
                      <p className="text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: itemDifficulty.color }}
                      >
                        <Sparkles className="h-3 w-3" />
                        {itemDifficulty.label}
                      </span>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
