import { AdminHeader } from "@/components/admin/AdminUI";
import ChapterForm from "@/components/admin/ChapterForm";

export const metadata = { title: "Add a chapter" };

export default function NewChapter() {
  return (
    <div className="shell">
      <AdminHeader title="Add a Chapter" back={{ href: "/admin/chapters", label: "All chapters" }} />
      <ChapterForm />
    </div>
  );
}
