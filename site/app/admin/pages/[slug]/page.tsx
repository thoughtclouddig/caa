import { notFound } from "next/navigation";
import { findEditablePage } from "@/content/editable-pages";
import { getPage } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { AdminHeader } from "@/components/admin/AdminUI";
import PageForm from "@/components/admin/PageForm";

export const dynamic = "force-dynamic";

export default async function EditPageCopy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const known = findEditablePage(slug);
  if (!known) notFound();

  const stored = await getPage(slug);

  return (
    <div className="shell">
      <AdminHeader
        title={known.title}
        back={{ href: "/admin/pages", label: "All page copy" }}
      />
      <PageForm
        slug={known.slug}
        where={known.where}
        guidance={known.guidance}
        bodyHtml={stored?.body ? bodyToHtml(stored.body) : ""}
      />
    </div>
  );
}
