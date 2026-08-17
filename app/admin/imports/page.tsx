import { FileSpreadsheet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/ui";

export default function AdminImportsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Imports"
        description="Bulk-manage the catalog with spreadsheet imports."
      />

      <EmptyState
        title="Excel import/export coming next"
        description="Upload, validate, preview, and confirm bulk changes to Experiences and Guides from a spreadsheet."
        action={
          <div className="flex items-center gap-2 text-sm text-muted">
            <FileSpreadsheet className="h-4 w-4" />
            Not yet available
          </div>
        }
      />
    </div>
  );
}
