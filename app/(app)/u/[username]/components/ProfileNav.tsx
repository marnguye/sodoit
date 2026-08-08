import Link from "next/link";

type View = "overview" | "list" | "achievements" | "posts";

const TABS: { key: View; label: string; view?: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "list", label: "My List", view: "list" },
  { key: "posts", label: "Posts", view: "posts" },
  { key: "achievements", label: "Achievements", view: "achievements" },
];

export function ProfileNav({
  username,
  active,
  showList,
}: {
  username: string;
  active: View;
  showList: boolean;
}) {
  const tabs = TABS.filter((tab) => tab.key !== "list" || showList);

  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      className="flex w-fit gap-1 rounded-full border border-border bg-white p-1"
    >
      {tabs.map((tab) => {
        const href = tab.view
          ? `/u/${username}?view=${tab.view}`
          : `/u/${username}`;
        const selected = active === tab.key;

        return (
          <Link
            key={tab.key}
            href={href}
            role="tab"
            aria-selected={selected}
            className={`flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors ${
              selected ? "bg-accent text-white" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
