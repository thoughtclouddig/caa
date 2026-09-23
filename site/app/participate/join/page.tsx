import Link from "next/link";
import { getMembershipTiers } from "@/lib/queries";
import { PageHero, Rows, Row, Notice } from "@/components/ui";

export const metadata = { title: "Join or renew" };
export const dynamic = "force-dynamic";

function price(cents: number | null) {
  if (cents === null) return "No dues";
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)} / year`;
}

export default async function JoinPage() {
  const tiers = await getMembershipTiers();

  return (
    <>
      <PageHero
        eyebrow="Join or renew"
        title="Join, Renew or Register"
        lede="Membership is how CAA is sustained. Nobody is turned away for cost."
      >
        <Link className="btn btn--primary" href="/register">Create an account</Link>
      </PageHero>

      <section className="section shell">
        <Notice tone="warn">
          Pricing is not final. These amounts are placeholders pending board confirmation,
          and the site reads them from the database so they can change without a code release.
        </Notice>

        <Rows>
          {tiers.map((t) => (
            <Row key={t.id} title={t.name} meta={price(t.amountCents)}>
              <p>{t.description}</p>
              {t.requiresVerification && <p>Verification required.</p>}
            </Row>
          ))}
        </Rows>
      </section>
    </>
  );
}
