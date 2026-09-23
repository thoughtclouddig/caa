import Link from "next/link";
import { PageHero } from "@/components/ui";
import { org } from "@/content/site";

export const metadata = { title: "Starting a Chapter" };

/**
 * The steps are CAA's own, taken from the existing site's "Starting a
 * Chapter" page rather than rewritten. The Chapter Handbook referenced
 * there is still in development, so this page does not promise it.
 */
const steps = [
  {
    title: "Advertise Your New Chapter",
    body: "A notice in your church bulletin, flyers, email, post cards and invitations at local airports, flight schools, aviation and aerospace company lounges, churches and college aviation department bulletin boards. Get permission before posting to private bulletin boards.",
  },
  {
    title: "Gather a Core Group",
    body: "Five or six people to begin. An ideal chapter is eight to fifteen, which keeps meetings relaxed and conversational.",
  },
  {
    title: "Hold a Formation Meeting",
    body: "Decide where and when you will meet, who will serve as officers, and who will be the chapter contact person for the CAA directory.",
  },
  {
    title: "Notify Headquarters",
    body: "Tell us once the chapter is formed and we will list it here and send promotional materials.",
  },
];

export default function StartChapterPage() {
  return (
    <>
      <PageHero
        eyebrow="Starting a Chapter"
        title="Think Big"
        lede="We are in the start-up phase of this apostolate, and we are looking for People of God who will take the initiative of starting a chapter in their location."
      >
        <Link className="btn btn--primary" href="/contact">Get in Touch</Link>
      </PageHero>

      <section className="section shell shell--narrow">
        <ol className="prose" style={{ maxWidth: "none" }}>
          {steps.map((s) => (
            <li key={s.title} style={{ marginBottom: "1.6rem" }}>
              <strong>{s.title}</strong>
              <br />
              {s.body}
            </li>
          ))}
        </ol>

        <p className="prose" style={{ maxWidth: "none" }}>
          A Chapter Handbook to guide you in chapter management is in development.
          For more information, or to tell us you are starting a chapter, write to{" "}
          {org.email}.
        </p>
      </section>
    </>
  );
}
