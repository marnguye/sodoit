import { LoadingState, PageShell } from "@/components/ui";

export default function FeedLoading() {
  return (
    <PageShell
      title="Community Feed"
      subtitle="Questions, tips, and real experiences from the community."
    >
      <LoadingState label="Loading Feed…" />
    </PageShell>
  );
}
