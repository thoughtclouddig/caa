import Link from "next/link";
import Image from "next/image";
import { getPage } from "@/lib/queries";
import { org } from "@/content/site";
import { BOARD } from "@/content/board";
import { bodyToHtml } from "@/lib/richtext";
import { PageHero } from "@/components/ui";
import styles from "./about.module.css";

export const metadata = {
  title: "About",
  description: "Who the Catholic Aviation Association is, and where it stands.",
};
export const dynamic = "force-dynamic";

/**
 * CAA's published positions, carried from the existing site in the
 * association's own words. They sit under About rather than on the
 * homepage: a visitor who wants to know where CAA stands will find them,
 * and they are not the first thing a prospective member meets.
 */
const positions = [
  {
    heading: "Pro-Life From Conception to Natural Death",
    paragraphs: [
      "More than 65 million lives have been taken by abortion since Roe v. Wade. The Guttmacher Institute, the research arm of Planned Parenthood, reports that abortions have risen to an all-time high since Roe was overturned, against everything the pro-life community expected.",
      "Much of that traces back to the FDA fast-tracking approval of the abortion pill mifepristone while stonewalling the evaluation of the health dangers that same pill poses.",
      "The answer lies with the Supreme Court recognizing what the 14th Amendment already holds: “nor shall any state deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.”",
      "CAA is unambiguously in support of the right to life from conception to natural death.",
    ],
  },
  {
    heading: "Catholic Social Teaching",
    paragraphs: [
      "From the Culture of Life to the preferential option for the poor, our members show forth Christ’s love for His creatures by putting service to those in need first. We hold to total fidelity to Catholic social teaching, without exception.",
      "In practice that runs from being there for a member in a spiritual battle, to direct aid close to home, to service projects, to mercy flights, to being a responsible citizen in the voting booth.",
    ],
  },
];

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <>
      <PageHero eyebrow="About" title="About CAA" lede={org.vision} />

      {/* Mission and a photograph, so the page opens with something to
          look at rather than three stacked headings. */}
      <section className="section shell">
        <div className={styles.opening}>
          <div>
            <h2 className={styles.heading}>Our Mission</h2>
            <p className="prose">{org.mission}</p>
            <p className="prose">
              We are the meeting place for Catholics in the worldwide
              aviation community.
            </p>
            {page?.body && (
              <>
                <h2 className={`${styles.heading} ${styles.headingSpaced}`}>Who We Are</h2>
                <div
                  className="prose rich"
                  dangerouslySetInnerHTML={{ __html: bodyToHtml(page.body) }}
                />
              </>
            )}
            <div className={styles.actions}>
              <Link className="btn btn--primary" href="/about/letter-from-the-chairman">
                Letter From the Chairman
              </Link>
              <Link className="btn btn--ghost" href="/about/patron-saints">
                Our Patron Saints
              </Link>
            </div>
          </div>

          <figure className={styles.figure}>
            <div className={styles.frame}>
              <Image
                src="/gallery/ncyc-stand.jpg"
                alt="Tom Beckenbauer and Christian Tombers at the CAA stand beneath banners reading Faith, Flying and Fellowship."
                fill
                sizes="(min-width: 58rem) 42vw, 100vw"
                className={styles.image}
              />
            </div>
            <figcaption className={styles.caption}>
              The association at the National Catholic Youth Conference.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The board, on a warm band so it reads as its own thing. */}
      <section className="section--warm">
        <div className="section shell">
          <h2 className={styles.heading}>The Board of Directors</h2>
          <ul className={styles.board}>
            {BOARD.map((member) => (
              <li key={member.name} className={styles.member}>
                <span className={styles.memberName}>{member.name}</span>
                <span className={styles.memberRole}>{member.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section shell">
        <h2 id="where-we-stand" className={styles.heading}>Where We Stand</h2>
        <div className={styles.positions}>
          {positions.map((p) => (
            <article key={p.heading} className={styles.position}>
              <h3 className={styles.positionHeading}>{p.heading}</h3>
              {p.paragraphs.map((text, i) => (
                <p key={i} className="prose">{text}</p>
              ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
