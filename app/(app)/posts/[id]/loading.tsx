import { LoadingState } from "@/components/ui";

export default function PostLoading() {
  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <LoadingState label="Loading post…" />
    </div>
  );
}
