import Link from "next/link";
import styles from "./SectionNav.module.css";

export default function SectionNav({
  title, items, action,
}: { title: string; items: { label: string; href: string }[]; action?: React.ReactNode }) {
  return (
    <nav className={styles.nav} aria-label={title}>
      <div className={`shell ${styles.inner}`}>
        <span className={styles.title}>{title}</span>
        <ul className={styles.list}>
          {items.map((i) => (
            <li key={i.href}><Link href={i.href}>{i.label}</Link></li>
          ))}
        </ul>
        {action}
      </div>
    </nav>
  );
}
