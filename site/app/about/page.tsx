import { getPage } from "@/lib/queries";
import { org } from "@/content/site";
import { PageHero } from "@/components/ui";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <>
      <PageHero eyebrow="About" title={page?.title ?? "About CAA"} lede={org.vision} />
      <section className="section shell shell--narrow">
        <h2>Our Mission</h2>
        <p className="prose" style={{ maxWidth: "none" }}>{org.mission}</p>
        <p className="prose" style={{ maxWidth: "none" }}>
          We are the meeting place for Catholics in the worldwide aviation community.
        </p>

        <h2 style={{ marginTop: "3rem" }}>Our Vision</h2>
        <p className="prose" style={{ maxWidth: "none" }}>{org.vision}</p>

        <h2 style={{ marginTop: "3rem" }}>{page?.title ?? "About CAA"}</h2>
        <p className="prose" style={{ maxWidth: "none" }}>{page?.body}</p>
      </section>
    </>
  );
}
