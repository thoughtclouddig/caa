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
        lede="Joining CAA costs nothing and never has to. You can also join at a level that helps carry the cost, though none of them buys anything a free member does not already have."
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
              <h2>Membership Levels</h2>
              <p className="prose">
                CAA runs on what members contribute. Join at whichever
                level fits: the association is the same for all of them,
                and the free one is a full membership, not a trial.
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
                  {/* Joining at a level, not donating at one. The chosen
                      level rides in the URL so registration knows which
                      membership is being taken out. */}
                  <Link
                    href={`/register?tier=${t.slug}`}
                    className={styles.tierCta}
                  >
                    Join at this level
                  </Link>
                </article>
              ))}
            </div>

            <Notice tone="warn">
              Dues cannot be collected yet. CAA has a contract with a payment
              processor separate from eCatholic, and those account details
              are still needed. Join at any level today and your membership
              is recorded; CAA will be in touch about dues once the
              processor is connected. Free membership is unaffected.
            </Notice>

            <div className={styles.support}>
              <Link className="btn btn--primary" href="/register">
                Join for free
              </Link>
              <Link className="btn btn--ghost" href="/participate/donate">
                Make a one-off gift instead
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
