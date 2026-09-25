import { getUpcomingEvents } from "@/lib/queries";
import { PageHero, Empty } from "@/components/ui";
import styles from "./events.module.css";

export const metadata = {
  title: "Events",
  description: "The worldwide Aviation Mass, and the chapter events anyone may attend.",
};
export const dynamic = "force-dynamic";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short" });
const DAY = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const YEAR = new Intl.DateTimeFormat("en-US", { year: "numeric" });

export default async function EventsPage() {
  const events = await getUpcomingEvents();
  const thisYear = new Date().getFullYear();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What Is Coming Up"
        lede="The worldwide Aviation Mass, and the chapter events anyone may attend."
      />

      <section className="section shell">
        {events.length === 0 ? (
          <Empty>Nothing is scheduled yet.</Empty>
        ) : (
          <ol className={styles.list}>
            {events.map((e) => {
              const showYear = e.startsAt.getFullYear() !== thisYear;
              return (
                <li key={e.id} className={styles.event}>
                  {/* The date is the first thing you need from a listing,
                      so it is a block you read at a glance rather than
                      small grey type pushed to the far edge. */}
                  <p className={styles.date}>
                    <span className={styles.month}>{MONTH.format(e.startsAt)}</span>
                    <span className={styles.day}>{DAY.format(e.startsAt)}</span>
                    {showYear && (
                      <span className={styles.year}>{YEAR.format(e.startsAt)}</span>
                    )}
                  </p>

                  <div className={styles.detail}>
                    <h2 className={styles.title}>{e.title}</h2>
                    <p className={styles.when}>
                      {WEEKDAY.format(e.startsAt)} at {TIME.format(e.startsAt)}
                      {e.location && <> &middot; {e.location}</>}
                    </p>
                    {e.description && <p className={styles.body}>{e.description}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
