import { getDirectory } from "@/lib/queries";
import { findMemberLocation } from "@/content/member-locations";
import { PageHero, Rows, Row, Empty, Notice } from "@/components/ui";
import MemberMap from "@/components/MemberMap";

export const metadata = { title: "Member directory" };
export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const members = await getDirectory();

  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Member Directory"
        lede="Only members who asked to be listed appear here, and only as the nearest city they picked from a list."
      />
      <section className="section shell">
        <Notice>
          You control whether you are listed, and which city you are shown
          near. Change either any time under Profile.
        </Notice>

        {members.length > 0 && <MemberMap members={members} />}

        {members.length === 0 ? (
          <Empty>No members have opted in yet.</Empty>
        ) : (
          <Rows>
            {members.map((m) => {
              const place = findMemberLocation(m.locationSlug);

              return (
                <Row key={m.id} title={m.name} meta={place?.label}>
                  <p>
                    {[m.aviationRole, m.chapterName].filter(Boolean).join(" · ")}
                  </p>
                </Row>
              );
            })}
          </Rows>
        )}
      </section>
    </>
  );
}
