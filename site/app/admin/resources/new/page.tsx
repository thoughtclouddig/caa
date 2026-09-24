import { adminListResources } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import ResourceForm from "@/components/admin/ResourceForm";
export const metadata = { title: "Add a resource" };
export const dynamic = "force-dynamic";
export default async function NewResource() {
  const existing = await adminListResources();
  const categories = [...new Set(existing.map((r) => r.category))];
  return (
    <div className="shell">
      <AdminHeader title="Add a Resource" back={{ href: "/admin/resources", label: "All resources" }} />
      <ResourceForm categories={categories} />
    </div>
  );
}
