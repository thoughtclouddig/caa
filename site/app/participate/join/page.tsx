import Link from "next/link";
import { getMembershipTiers } from "@/lib/queries";
import { PageHero, Notice } from "@/components/ui";
import styles from "./join.module.css";

export const metadata = {
  title: "Join, Renew or Register",
  description:
    "Membership of the Catholic Aviation Association is free. Support above that is voluntary.",
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
  const [free, ...support] = tiers;

  return (
    <>
      <PageHero
        eyebrow="Join or Renew"
        title="Membership Is Free"
        lede="Joining CAA costs nothing and never has to. What follows is for members who want to help carry the cost, and none of it buys anything a free member does not already have."
      >
        <Link className="btn btn--primary" href="/register">
          Join CAA
        </Link>
      </PageHero>

      {free && (
        <section className="section shell">
          <article className={styles.free}>
            <div>
              <p className="eyebrow">Everyone who joins</p>
              <h2 className={styles.freeName}>{free.name}</h2>
              <p className={styles.freeBody}>{free.description}</p>
            </div>
            <div className={styles.freePrice}>
              <span>{price(free.amountCents, free.cadence)}</span>
              <Link className="btn btn--primary" href="/register">
                Join CAA
              </Link>
            </div>
          </article>
        </section>
      )}

      {support.length > 0 && (
        <section className="section--warm">
          <div className="section shell">
            <div className={styles.supportHead}>
              <h2>Ways to Support the Work</h2>
              <p className="prose">
                CAA runs on what members give. These levels exist so that
                giving has a shape, not so that membership has a price.
              </p>
            </div>

            <div className={styles.tiers}>
              {support.map((t) => (
                <article key={t.id} className={styles.tier}>
                  <h3 className={styles.tierName}>{t.name}</h3>
                  <p className={styles.tierPrice}>
                    {price(t.amountCents, t.cadence)}
                  </p>
                  <p className={styles.tierBody}>{t.description}</p>
                  {/* Every level is actionable. Reading an amount with
                      nothing to click is how a price list becomes a
                      dead end. */}
                  {/* The amount rides in the URL so the giving form opens
                      filled in. Arriving at an empty box after choosing a
                      level is its own kind of dead end. */}
                  <Link
                    href={`/participate/donate?amount=${(t.amountCents ?? 0) / 100}&tier=${t.slug}`}
                    className={styles.tierCta}
                  >
                    Give at this level
                  </Link>
                </article>
              ))}
            </div>

            <Notice tone="warn">
              Giving is not connected yet. CAA has a contract with a payment
              processor separate from eCatholic, and those account details
              are still needed before anything can be charged. Until then the
              giving form records an intention only. Joining, which is free,
              works today.
            </Notice>

            <div className={styles.support}>
              <Link className="btn btn--primary" href="/participate/donate">
                Give to CAA
              </Link>
              <Link className="btn btn--ghost" href="/register">
                Join for free
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
