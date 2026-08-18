import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GuideForm } from "@/components/admin/guides/GuideForm";

export default function NewGuidePage() {
  return (
    <div>
      <AdminPageHeader
        title="New guide"
        description="Create a new itinerary or collection."
      />
      <GuideForm />
    </div>
  );
}
