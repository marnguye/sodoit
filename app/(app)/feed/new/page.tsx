import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PageShell, Card } from "@/components/ui";
import { POST_TYPES } from "../types";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title")
    .order("title", { ascending: true });

  return (
    <PageShell
      title="Create post"
      subtitle="Ask a question, share a tip, or post about an experience."
    >
      <Card className="max-w-[600px]">
        <form action={createPost} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-[13px] font-semibold text-ink mb-1.5"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={POST_TYPES[0]}
              className="w-full h-11 border border-border rounded-md px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all capitalize"
            >
              {POST_TYPES.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="experienceId"
              className="block text-[13px] font-semibold text-ink mb-1.5"
            >
              Linked experience (optional)
            </label>
            <select
              id="experienceId"
              name="experienceId"
              defaultValue=""
              className="w-full h-11 border border-border rounded-md px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="">None</option>
              {(experiences ?? []).map((experience) => (
                <option key={experience.id} value={experience.id}>
                  {experience.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-[13px] font-semibold text-ink mb-1.5"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={140}
              className="w-full h-11 border border-border rounded-md px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="body"
              className="block text-[13px] font-semibold text-ink mb-1.5"
            >
              Body
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={6}
              className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-md bg-accent hover:bg-accent-dark text-white text-sm font-bold transition-colors"
          >
            Post to Feed
          </button>
        </form>
      </Card>
    </PageShell>
  );
}
