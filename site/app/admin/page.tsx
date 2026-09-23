import { adminStats, adminDonationTotals } from "@/lib/queries";
import { PageHero, StatRow, Stat, Notice } from "@/components/ui";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [stats, giving] = await Promise.all([adminStats(), adminDonationTotals()]);

  return (
    <>
      <PageHero eyebrow="Admin" title="Overview" />
      <section className="section shell">
        <StatRow>
          <Stat label="Accounts" value={stats.members} />
          <Stat label="Chapters" value={stats.chapters} />
          <Stat label="Events" value={stats.events} />
          <Stat label="Prayer queue" value={stats.pendingPrayers} />
          <Stat label="Recorded giving" value={`$${(Number(giving.total) / 100).toFixed(0)}`} />
        </StatRow>
        <Notice tone="warn">
          Recorded giving reflects intent captured on the site, not settled payments.
          No processor is connected yet.
        </Notice>
      </section>
    </>
  );
}
