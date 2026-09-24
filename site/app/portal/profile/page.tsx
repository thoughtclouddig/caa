import { requireUser } from "@/lib/auth";
import { getActiveChapters } from "@/lib/queries";
import { MEMBER_LOCATIONS } from "@/content/member-locations";
import { PageHero } from "@/components/ui";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const chapters = await getActiveChapters();

  return (
    <>
      <PageHero eyebrow="Profile" title="Your Details" />
      <section className="section shell">
        <ProfileForm
          user={{
            name: user.name,
            aviationRole: user.aviationRole,
            locationSlug: user.locationSlug,
            designation: user.designation,
            designationVerified: user.designationVerified,
            chapterId: user.chapterId,
            showInDirectory: user.showInDirectory,
          }}
          chapters={chapters.map((c) => ({ id: c.id, name: c.name }))}
          locations={MEMBER_LOCATIONS.map((l) => ({ slug: l.slug, label: l.label }))}
        />
      </section>
    </>
  );
}
