import { requireUser } from "@/lib/auth";
import { getActiveChapters } from "@/lib/queries";
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
            city: user.city,
            region: user.region,
            country: user.country,
            chapterId: user.chapterId,
            showInDirectory: user.showInDirectory,
          }}
          chapters={chapters.map((c) => ({ id: c.id, name: c.name }))}
        />
      </section>
    </>
  );
}
