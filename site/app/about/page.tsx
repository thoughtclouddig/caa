import Link from "next/link";
import { getPage } from "@/lib/queries";
import { org } from "@/content/site";
import { PageHero } from "@/components/ui";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

/**
 * CAA's published positions, carried over from the existing site's
 * "Come Follow Me" page in the association's own words.
 *
 * These are the most pointed statements CAA makes anywhere. They sit here,
 * under About, rather than on the homepage: a visitor who wants to know
 * where the association stands will find them, and they are not the first
 * thing a prospective member meets. Whether that is the right placement is
 * a board decision, not a copy decision.
 */
const positions = [
  {
    heading: "Pro-Life From Conception to Natural Death",
    paragraphs: [
      "More than 65 million lives have been taken by abortion since Roe v. Wade. The Guttmacher Institute, the research arm of Planned Parenthood, reports that abortions have risen to an all-time high since Roe was overturned, against everything the pro-life community expected.",
      "Much of that traces back to the FDA fast-tracking approval of the abortion pill mifepristone while stonewalling the evaluation of the health dangers that same pill poses.",
      "The answer lies with the Supreme Court recognizing what the 14th Amendment already holds: \"nor shall any state deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.\"",
      "CAA is unambiguously in support of the right to life from conception to natural death.",
    ],
  },
  {
    heading: "Catholic Social Teaching",
    paragraphs: [
      "From the Culture of Life to the preferential option for the poor, our members show forth Christ's love for His creatures by putting service to those in need first. We hold to total fidelity to Catholic social teaching, without exception.",
      "In practice that runs from being there for a member in a spiritual battle, to direct aid close to home, to service projects, to mercy flights, to being a responsible citizen in the voting booth.",
    ],
  },
];

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <>
      <PageHero
        eyebrow="About"
        title="About CAA"
        lede={org.vision}
      >
        <Link className="btn btn--ghost" href="/about/patron-saints">
          Our Patron Saints
        </Link>
      </PageHero>

      <section className="section shell shell--narrow">
        <h2>Our Mission</h2>
        <p className="prose" style={{ maxWidth: "none" }}>{org.mission}</p>
        <p className="prose" style={{ maxWidth: "none" }}>
          We are the meeting place for Catholics in the worldwide aviation
          community.
        </p>

        {page?.body && (
          <>
            <h2 style={{ marginTop: "3rem" }}>Who We Are</h2>
            <p className="prose" style={{ maxWidth: "none" }}>{page.body}</p>
          </>
        )}

        <h2 id="where-we-stand" style={{ marginTop: "3.5rem" }}>Where We Stand</h2>
        {positions.map((p) => (
          <article key={p.heading} style={{ marginTop: "2.5rem" }}>
            <h3>{p.heading}</h3>
            <hr className="rule" />
            {p.paragraphs.map((text, i) => (
              <p key={i} className="prose" style={{ maxWidth: "none" }}>
                {text}
              </p>
            ))}
          </article>
        ))}
      </section>
    </>
  );
}
