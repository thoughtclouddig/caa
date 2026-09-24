import { notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";
export const metadata = { title: "Edit item" };
export const dynamic = "force-dynamic";
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await adminGetProduct(Number(id));
  if (!product) notFound();
  return (
    <div className="shell">
      <AdminHeader title="Edit Item" back={{ href: "/admin/store", label: "The store" }} />
      <ProductForm product={product} />
    </div>
  );
}
