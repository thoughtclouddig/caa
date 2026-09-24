import Link from "next/link";
import styles from "./AdminUI.module.css";

/**
 * Furniture for the admin tools.
 *
 * The public site is designed to be read. These screens are designed to be
 * worked in: denser, plainer, and built so the next thing to do is always
 * visible without hunting. Same palette and type, different job.
 */

export function AdminHeader({
  title,
  lede,
  action,
  back,
}: {
  title: string;
  lede?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        {back && (
          <Link href={back.href} className={styles.back}>
            &larr; {back.label}
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </header>
  );
}

/** A saved/failed banner, driven by a query string after a redirect. */
export function Flash({ message, tone = "ok" }: { message: string; tone?: "ok" | "warn" }) {
  return (
    <p className={`${styles.flash} ${tone === "warn" ? styles.flashWarn : ""}`} role="status">
      {message}
    </p>
  );
}

export function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className={styles.panel}>
      {title && <h2 className={styles.panelTitle}>{title}</h2>}
      {children}
    </section>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Status at a glance. Colour is never the only signal; the word is there. */
export function Pill({ tone, children }: { tone: "live" | "draft" | "muted" | "alert"; children: React.ReactNode }) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <p>{children}</p>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>;
}
