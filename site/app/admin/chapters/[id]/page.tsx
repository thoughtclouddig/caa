import { notFound } from "next/navigation";
import { adminGetChapter } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import ChapterForm from "@/components/admin/ChapterForm";

export const metadata = { title: "Edit chapter" };
export const dynamic = "force-dynamic";

export default async function EditChapter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = await adminGetChapter(Number(id));
  if (!chapter) notFound();

  return (
    <div className="shell">
      <AdminHeader title="Edit Chapter" back={{ href: "/admin/chapters", label: "All chapters" }} />
      <ChapterForm chapter={chapter} />
    </div>
  );
}
