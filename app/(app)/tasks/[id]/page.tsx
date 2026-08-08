import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Sparkles, Users, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Avatar, Card, ExperienceImage } from "@/components/ui";
import { getTaskMeta } from "@/app/(app)/browse/types";
import type { ListStatus } from "@/app/(app)/browse/types";
import { ActionPanel } from "./ActionPanel";

interface TaskRow {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  image_alt: string | null;
}

const PRACTICAL_TIPS: readonly string[] = [
  "Block a fixed time on your calendar instead of waiting for motivation.",
  "Tell a friend you're doing this — accountability makes it stick.",
  "Break it into one small first step you can do today.",
  "Take a photo when you finish. It's optional, but future-you will thank you.",
];

interface CommunityCompletion {
  name: string;
  when: string;
}

const COMMUNITY_COMPLETIONS: readonly CommunityCompletion[] = [
  { name: "Mara K.", when: "2 days ago" },
  { name: "Teo V.", when: "5 days ago" },
  { name: "Ines M.", when: "1 week ago" },
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
    .select("id, title, category, image_url, image_alt")
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
        .select("id, title, category")
        .eq("category", task.category)
        .neq("id", task.id)
        .limit(3)
    : { data: [] as { id: string; title: string; category: string | null }[] };

  const { difficulty, adoption, completions } = getTaskMeta(task.id);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <ExperienceImage
          id={task.id}
          title={task.title}
          imageUrl={task.image_url}
          imageAlt={task.image_alt}
          className="order-1 lg:order-none lg:col-start-1 lg:row-start-1 h-[320px] sm:h-[360px] rounded-2xl"
          sizes="(min-width: 1024px) 700px, 100vw"
        />

        <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:sticky lg:top-20 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {task.category && <Badge variant="accent">{task.category}</Badge>}
            <span
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: difficulty.color }}
            >
              <Sparkles className="h-3 w-3" />
              {difficulty.label} · {difficulty.xp} XP
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Users className="h-3 w-3" />
              {adoption} added · {completions} completed
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-ink">{task.title}</h1>

          <ActionPanel
            taskId={task.id}
            taskTitle={task.title}
            initialStatus={status}
            signedIn={!!user}
            totalCompleted={totalCompleted}
          />
        </div>

        <Card className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold text-ink">
              About this experience
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              No description yet — just a good idea worth doing.
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

        <div className="order-4 lg:order-none lg:col-start-1 lg:row-start-3">
          <h2 className="text-sm font-bold text-ink">Community completions</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COMMUNITY_COMPLETIONS.map((entry) => (
              <Card key={entry.name} className="flex items-center gap-3 p-3">
                <Avatar name={entry.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted">{entry.when}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {similar && similar.length > 0 && (
          <div className="order-5 lg:order-none lg:col-start-1 lg:row-start-4">
            <h2 className="text-sm font-bold text-ink">Similar tasks</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similar.map((item) => {
                const meta = getTaskMeta(item.id);
                return (
                  <Link key={item.id} href={`/tasks/${item.id}`}>
                    <Card className="h-full flex flex-col gap-2 hover:border-accent transition-colors">
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
                        style={{ color: meta.difficulty.color }}
                      >
                        <Sparkles className="h-3 w-3" />
                        {meta.difficulty.label} · {meta.difficulty.xp} XP
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Users className="h-3 w-3" />
                        {meta.adoption} added · {meta.completions} completed
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
