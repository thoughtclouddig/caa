import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import SectionNav from "@/components/SectionNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  // Admin tools are staff-only. Members land back in their own area.
  if (user.role !== "admin") redirect("/portal");

  const items = [
    { label: "Overview", href: "/admin" },
    { label: "Members", href: "/admin/members" },
    { label: "Chapters", href: "/admin/chapters" },
    { label: "Stories", href: "/admin/stories" },
    { label: "Events", href: "/admin/events" },
    { label: "Prayer queue", href: "/admin/prayer" },
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
