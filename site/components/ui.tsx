import Link from "next/link";
import Image from "next/image";
import styles from "./ui.module.css";

/**
 * The head of an interior page.
 *
 * Navy, centred, with the gold rule: the sub-hero from the approved
 * mockup. The earlier version was left-aligned on a warm ground, which
 * left the right half of every interior page empty and gave the whole site
 * one weightless opening. This one carries its own colour and sits the
 * type in the middle of the measure, so nothing is waiting to be filled.
 */
export function PageHero({
  eyebrow, title, lede, children,
}: { eyebrow?: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <header className={styles.pageHero}>
      <div className="shell">
        {eyebrow && <p className={styles.heroEyebrow}>{eyebrow}</p>}
        <h1 className={styles.heroTitle}>{title}</h1>
        <hr className={styles.heroRule} />
        {lede && <p className={styles.heroLede}>{lede}</p>}
        {children && <div className={styles.heroActions}>{children}</div>}
      </div>
    </header>
  );
}

/** A rule-separated list. Used instead of card grids throughout. */
export function Rows({ children }: { children: React.ReactNode }) {
  return <div className={styles.rows}>{children}</div>;
}

export function Row({
  title, meta, children, href,
}: { title: string; meta?: string; children?: React.ReactNode; href?: string }) {
  const body = (
    <>
      <div className={styles.rowMain}>
        <h3>{title}</h3>
        {children && <div className="prose">{children}</div>}
      </div>
      {meta && <p className={styles.rowMeta}>{meta}</p>}
    </>
  );
  return href
    ? <Link href={href} className={`${styles.row} ${styles.rowLink}`}>{body}</Link>
    : <div className={styles.row}>{body}</div>;
}

/**
 * A grid of links with room to say what each one is.
 *
 * Replaces a hairline list for the section index pages. No icons and no
 * numbering: the type and a gold edge on hover do the work, which is what
 * the brand asks for and what keeps four items from looking like a
 * dashboard.
 */
export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.cardGrid}>{children}</div>;
}

export function LinkCard({
  title, body, href, meta, image, imageAlt,
}: {
  title: string;
  body?: string;
  href: string;
  meta?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      {image && (
        <div className={styles.cardFrame}>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            sizes="(min-width: 62rem) 30vw, (min-width: 42rem) 48vw, 100vw"
            className={styles.cardImage}
          />
        </div>
      )}
      <div className={styles.cardCopy}>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
        <h3 className={styles.cardTitle}>{title}</h3>
        {body && <p className={styles.cardBody}>{body}</p>}
        <span className={styles.cardGo} aria-hidden="true">&rarr;</span>
      </div>
    </Link>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "ok"; children: React.ReactNode }) {
  return <p className={`${styles.notice} ${styles[tone]}`}>{children}</p>;
}

export function Field({
  label, name, type = "text", defaultValue, required, placeholder, help, autoComplete,
}: {
  label: string; name: string; type?: string; defaultValue?: string | null;
  required?: boolean; placeholder?: string; help?: string; autoComplete?: string;
}) {
  return (
    <p className={styles.field}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input id={name} name={name} type={type} required={required} autoComplete={autoComplete}
        defaultValue={defaultValue ?? undefined} placeholder={placeholder} />
      {help && <span className={styles.help}>{help}</span>}
    </p>
  );
}

export function TextArea({
  label, name, defaultValue, required, rows = 4, help,
}: { label: string; name: string; defaultValue?: string | null; required?: boolean; rows?: number; help?: string }) {
  return (
    <p className={styles.field}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <textarea id={name} name={name} rows={rows} required={required} defaultValue={defaultValue ?? undefined} />
      {help && <span className={styles.help}>{help}</span>}
    </p>
  );
}

export function Select({
  label, name, options, defaultValue, help,
}: {
  label: string; name: string; defaultValue?: string | null; help?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <p className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue ?? ""}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {help && <span className={styles.help}>{help}</span>}
    </p>
  );
}

export function Checkbox({
  label, name, defaultChecked, help,
}: { label: string; name: string; defaultChecked?: boolean; help?: string }) {
  return (
    <p className={styles.checkbox}>
      <label>
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span>{label}</span>
      </label>
      {help && <span className={styles.help}>{help}</span>}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.statRow}>{children}</div>;
}

export function FormCard({ children }: { children: React.ReactNode }) {
  return <div className={styles.formCard}>{children}</div>;
}
