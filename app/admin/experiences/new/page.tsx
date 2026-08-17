import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/experiences/ExperienceForm";

export default function NewExperiencePage() {
  return (
    <div>
      <AdminPageHeader
        title="New experience"
        description="Create a new entry in the experience catalog."
      />
      <ExperienceForm />
    </div>
  );
}
