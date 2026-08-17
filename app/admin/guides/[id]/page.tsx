import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GuideForm } from "@/components/admin/guides/GuideForm";
import { GuideItemsEditor } from "@/components/admin/guides/GuideItemsEditor";
import { getGuideAdmin } from "@/lib/admin/guides/queries";
import { UUID_RE } from "@/lib/validation";

interface EditGuidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const guide = await getGuideAdmin(id);
  if (!guide) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <AdminPageHeader
          title={guide.title}
          description={guide.is_public ? "Published guide." : "Hidden guide."}
        />
        <GuideForm guide={guide} />
      </div>

      <div className="border-t border-border pt-8">
        <GuideItemsEditor guideId={guide.id} items={guide.items} />
      </div>
    </div>
  );
}
