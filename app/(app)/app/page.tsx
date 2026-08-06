import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Badge, Card } from "@/components/ui";

export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from("user_lists")
    .select("id, experiences(id, title, description, category)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-extrabold text-ink">Your list</h1>

      {!saved?.length ? (
        <div className="mt-8 border border-dashed border-border rounded-2xl p-10 text-center">
          <p className="text-sm text-muted">
            Your list is empty. Find something worth doing.
          </p>
          <Link
            href="/browse"
            className="inline-block mt-4 text-accent font-semibold text-sm hover:text-accent-dark transition-colors"
          >
            Browse experiences →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {saved.map((item) => {
            const exp = Array.isArray(item.experiences)
              ? item.experiences[0]
              : item.experiences;
            if (!exp) return null;
            return (
              <Card key={item.id} className="flex flex-col gap-2">
                {exp.category && <Badge variant="accent">{exp.category}</Badge>}
                <h3 className="text-base font-bold text-ink">{exp.title}</h3>
                {exp.description && (
                  <p className="text-sm text-muted">{exp.description}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
