import { notFound } from "next/navigation";
import { adminGetResource, adminListResources } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { AdminHeader } from "@/components/admin/AdminUI";
import ResourceForm from "@/components/admin/ResourceForm";
export const metadata = { title: "Edit resource" };
export const dynamic = "force-dynamic";
export default async function EditResource({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [resource, all] = await Promise.all([
    adminGetResource(Number(id)),
    adminListResources(),
  ]);
  if (!resource) notFound();
  return (
    <div className="shell">
      <AdminHeader title="Edit Resource" back={{ href: "/admin/resources", label: "All resources" }} />
      <ResourceForm
        resource={resource}
        bodyHtml={resource.body ? bodyToHtml(resource.body) : ""}
        categories={[...new Set(all.map((r) => r.category))]}
      />
    </div>
  );
}
