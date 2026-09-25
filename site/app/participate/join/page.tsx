import Link from "next/link";
import { getMembershipTiers } from "@/lib/queries";
import { PageHero, Notice } from "@/components/ui";
import styles from "./join.module.css";

export const metadata = {
  title: "Join, Renew or Register",
  description:
    "Membership of the Catholic Aviation Association is free. You can also join at a level that helps carry the cost.",
};
export const dynamic = "force-dynamic";

function price(cents: number | null, cadence: string) {
  if (cents === null) return "Any amount";
  if (cents === 0) return "Free";
  const amount = `$${(cents / 100).toLocaleString("en-US")}`;
  return cadence === "once" ? `${amount} once` : `${amount} a year`;
}

export default async function JoinPage() {
  const tiers = await getMembershipTiers();

  return (
    <>
      <PageHero
        eyebrow="Join or Renew"
        title="Choose Your Membership"
        lede="The free level is a real membership, not a trial, and it stays free. The levels above it carry more of the cost and include more in return. Open any one to see what it holds."
      />

      <section className="section shell">
        {/*
          All five levels at one weight. The free tier used to run full
          width above the rest, which made the others read as an
          afterthought at the bottom of the page. Free is a choice among
          the choices, not a different kind of thing.
        */}
        <ul className={styles.tiers}>
          {tiers.map((t) => {
            const isFree = t.amountCents === 0;
            return (
              <li key={t.id} className={styles.tier}>
                <div className={styles.head}>
                  <h2 className={styles.name}>{t.name}</h2>
                  <p className={styles.price}>{price(t.amountCents, t.cadence)}</p>
                  {isFree && <p className={styles.flag}>Start here</p>}
                </div>
                <p className={styles.body}>{t.description}</p>
                <Link
                  href={isFree ? "/register" : `/register?tier=${t.slug}`}
                  className={`btn ${isFree ? "btn--primary" : "btn--ghost"} ${styles.cta}`}
                >
                  Join
                </Link>

                {/*
                  A native details element: keyboard operable, announced as
                  expandable, and open by default for anyone who has asked
                  the browser to find text on the page. No JavaScript, and
                  it works before hydration.
                */}
                {t.benefits.length > 0 && (
                  <details className={styles.more}>
                    <summary className={styles.summary}>
                      What you get
                    </summary>
                    <ul className={styles.benefits}>
                      {t.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>

        <Notice tone="warn">
          Dues cannot be collected yet. CAA has a contract with a payment
          processor separate from eCatholic, and those account details are
          still needed. Join at any level today and your membership is
          recorded; CAA will be in touch about dues once the processor is
          connected. Free membership is unaffected.
        </Notice>

        <p className={`prose ${styles.footnote}`}>
          Prefer to give without taking out a membership?{" "}
          <Link href="/participate/donate">Make a one-off gift</Link>.
        </p>
      </section>
    </>
  );
}
