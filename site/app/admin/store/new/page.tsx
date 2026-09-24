import { AdminHeader } from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";
export const metadata = { title: "Add an item" };
export default function NewProduct() {
  return (
    <div className="shell">
      <AdminHeader title="Add an Item" back={{ href: "/admin/store", label: "The store" }} />
      <ProductForm />
    </div>
  );
}
