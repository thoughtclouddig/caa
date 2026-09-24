import { AdminHeader } from "@/components/admin/AdminUI";
import PartnerForm from "@/components/admin/PartnerForm";
export const metadata = { title: "Add a partner" };
export default function NewPartner() {
  return (
    <div className="shell">
      <AdminHeader title="Add a Partner" back={{ href: "/admin/partners", label: "All partners" }} />
      <PartnerForm />
    </div>
  );
}
