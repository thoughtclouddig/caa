import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import SectionNav from "@/components/SectionNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  // Admin tools are staff-only. Members land back in their own area.
  if (user.role !== "admin") redirect("/portal");

  // Ordered by how often staff need them, not alphabetically.
  const items = [
    { label: "Overview", href: "/admin" },
    { label: "Articles", href: "/admin/articles" },
    { label: "Events", href: "/admin/events" },
    { label: "Chapters", href: "/admin/chapters" },
    { label: "Prayer queue", href: "/admin/prayer" },
    { label: "Members", href: "/admin/members" },
  ];

  return (
    <>
      <SectionNav
        title="Admin"
        items={items}
        action={
          <form action={signOutAction}>
            <button className="btn btn--ghost" type="submit"
              style={{ padding: "0.5rem 1rem", minHeight: "auto", fontSize: "0.85rem" }}>
              Sign out
            </button>
          </form>
        }
      />
      {children}
    </>
  );
}
