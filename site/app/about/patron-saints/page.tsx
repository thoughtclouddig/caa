import { PageHero } from "@/components/ui";

export const metadata = { title: "Our Patron Saints" };

/**
 * Both entries are summaries in CAA's framing of the same two patrons the
 * existing site names. The existing page quotes catholicsaints.info and
 * catholic.org at length; those passages are third-party text, so this page
 * carries CAA's own summary and cites the sources instead.
 */
const patrons = [
  {
    name: "Our Lady of Loreto",
    patronage: "Patroness of aviators and air travellers",
    body:
      "The title refers to the Holy House of Loreto, the house in which Mary was born and where the Annunciation occurred. Tradition holds that angels carried the little house from the Holy Land to Tersato in 1291, to Recanati in 1294, and finally to Loreto, where it has stood for centuries. It was that flight that led to her patronage of everyone involved in aviation. The shrine is the first of international renown dedicated to the Blessed Virgin, and has been held in special esteem by the Popes.",
    source: "catholicsaints.info",
  },
  {
    name: "St. Joseph of Cupertino",
    patronage: "Patron of pilots and air passengers",
    body:
      "A Franciscan mystic born at Cupertino in Italy and ordained among the Conventual Franciscans in 1628. He became known for many gifts, the most famous being his levitation in prayer, which drew such crowds that he was moved repeatedly between friaries and finally confined. He died at Osimo and was canonised in 1767.",
    source: "catholic.org",
  },
];

export default function PatronSaintsPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Our Patron Saints"
        lede="Two saints whose lives left the ground, and who have been asked for centuries to watch over those who do the same."
      />
      <section className="section shell shell--narrow">
        {patrons.map((p) => (
          <article key={p.name} style={{ marginBottom: "3.5rem" }}>
            <h2>{p.name}</h2>
            <p className="eyebrow">{p.patronage}</p>
            <hr className="rule" />
            <p className="prose" style={{ maxWidth: "none" }}>{p.body}</p>
            <p style={{ color: "var(--slate)", fontSize: "0.9rem" }}>
              Source: {p.source}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
