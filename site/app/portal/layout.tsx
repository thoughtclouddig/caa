import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import SectionNav from "@/components/SectionNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const items = [
    { label: "Dashboard", href: "/portal" },
    { label: "Directory", href: "/portal/directory" },
    { label: "My chapter", href: "/portal/chapter" },
    { label: "Prayer", href: "/portal/prayer" },
    { label: "Events", href: "/portal/events" },
    { label: "Mentorship", href: "/portal/mentorship" },
    { label: "Giving", href: "/portal/giving" },
    { label: "Profile", href: "/portal/profile" },
  ];

  return (
    <>
      <SectionNav
        title="Member area"
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
