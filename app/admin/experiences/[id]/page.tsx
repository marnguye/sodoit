import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/experiences/ExperienceForm";
import { getExperienceAdmin } from "@/lib/admin/experiences/queries";
import { UUID_RE } from "@/lib/validation";

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({
  params,
}: EditExperiencePageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const experience = await getExperienceAdmin(id);
  if (!experience) notFound();

  return (
    <div>
      <AdminPageHeader
        title={experience.title}
        description={
          experience.is_public ? "Published experience." : "Hidden experience."
        }
      />
      <ExperienceForm experience={experience} />
    </div>
  );
}
