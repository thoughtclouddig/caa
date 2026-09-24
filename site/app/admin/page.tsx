import Link from "next/link";
import { adminStats, adminDonationTotals, adminPendingPrayers, adminListArticles } from "@/lib/queries";
import { AdminHeader, Panel, Pill } from "@/components/admin/AdminUI";
import styles from "./dashboard.module.css";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

/**
 * The admin home.
 *
 * Counts alone do not tell anyone what to do next, so this leads with the
 * things actually waiting on a person: intentions to review, drafts left
 * unpublished, articles with no photograph. Numbers follow underneath.
 */
export default async function AdminHome() {
  const [stats, giving, pending, articles] = await Promise.all([
    adminStats(),
    adminDonationTotals(),
    adminPendingPrayers(),
    adminListArticles(),
  ]);

  const drafts = articles.filter((a) => a.status === "draft");
  const missingImages = articles.filter((a) => a.status === "published" && !a.imagePath);
  const featured = articles.find((a) => a.isFeatured && a.status === "published");

  const tasks = [
    pending.length > 0 && {
      href: "/admin/prayer",
      label: `${pending.length} prayer ${pending.length === 1 ? "intention" : "intentions"} waiting`,
      detail: "Nothing appears publicly until it is approved.",
    },
    drafts.length > 0 && {
      href: "/admin/articles",
      label: `${drafts.length} unpublished ${drafts.length === 1 ? "draft" : "drafts"}`,
      detail: "Written but not live yet.",
    },
    missingImages.length > 0 && {
      href: "/admin/articles",
      label: `${missingImages.length} published ${missingImages.length === 1 ? "article has" : "articles have"} no photograph`,
      detail: "The brief shows in place of the image until one is added.",
    },
    !featured && {
      href: "/admin/articles",
      label: "No article is set as the homepage lead",
      detail: "The most recent published article is being used instead.",
    },
  ].filter(Boolean) as { href: string; label: string; detail: string }[];

  return (
    <div className="shell">
      <AdminHeader
        title="Admin"
        lede="Everything on the public site is edited from here."
        action={
          <>
            <Link href="/admin/articles/new" className="btn btn--primary">Write an article</Link>
            <Link href="/" className="btn btn--ghost">View the site</Link>
          </>
        }
      />

      <Panel title="Waiting on you">
        {tasks.length === 0 ? (
          <p className={styles.clear}>Nothing is waiting. The site is up to date.</p>
        ) : (
          <ul className={styles.tasks}>
            {tasks.map((t) => (
              <li key={t.label}>
                <Link href={t.href} className={styles.task}>
                  <span className={styles.taskLabel}>{t.label}</span>
                  <span className={styles.taskDetail}>{t.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="The site at a glance">
        <dl className={styles.stats}>
          <div>
            <dt>Accounts</dt>
            <dd>{stats.members}</dd>
          </div>
          <div>
            <dt>Chapters</dt>
            <dd>{stats.chapters}</dd>
          </div>
          <div>
            <dt>Articles live</dt>
            <dd>{articles.filter((a) => a.status === "published").length}</dd>
          </div>
          <div>
            <dt>Events</dt>
            <dd>{stats.events}</dd>
          </div>
          <div>
            <dt>Giving recorded</dt>
            <dd>${(Number(giving.total) / 100).toFixed(0)}</dd>
          </div>
        </dl>
        <p className={styles.caveat}>
          <Pill tone="alert">Note</Pill> Giving is intent captured on the
          site, not money received. No payment processor is connected yet,
          so nothing has been charged.
        </p>
      </Panel>
    </div>
  );
}
