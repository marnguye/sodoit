import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { EmptyState } from "@/components/ui";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminPlaceRow {
  id: string;
  name: string;
  city_slug: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_public: boolean;
}

export default async function AdminPlacesPage() {
  const client = createAdminClient();
  const { data, error } = await client
    .from("places")
    .select("id, name, city_slug, country_code, latitude, longitude, is_public")
    .order("name")
    .limit(100);

  if (error) throw error;

  const places = (data ?? []) as AdminPlaceRow[];

  return (
    <div>
      <AdminPageHeader
        title="Places"
        description="Read-only overview. Full editing lands in a later batch."
      />

      {places.length === 0 ? (
        <EmptyState
          title="No places yet"
          description="Places are populated by the import tooling. Full Places CRUD is coming in a future batch."
        />
      ) : (
        <div className="overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {places.map((place) => (
                <tr key={place.id}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {place.name}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {[place.city_slug, place.country_code]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {place.latitude != null && place.longitude != null
                      ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                      : "Missing"}
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge
                      tone={place.is_public ? "published" : "hidden"}
                    >
                      {place.is_public ? "Published" : "Hidden"}
                    </AdminStatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
