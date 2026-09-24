import { notFound } from "next/navigation";
import { adminGetPartner } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import PartnerForm from "@/components/admin/PartnerForm";
export const metadata = { title: "Edit partner" };
export const dynamic = "force-dynamic";
export default async function EditPartner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await adminGetPartner(Number(id));
  if (!partner) notFound();
  return (
    <div className="shell">
      <AdminHeader title="Edit Partner" back={{ href: "/admin/partners", label: "All partners" }} />
      <PartnerForm partner={partner} />
    </div>
  );
}
