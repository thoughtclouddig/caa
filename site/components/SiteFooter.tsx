import Link from "next/link";
import Image from "next/image";
import { org, footerNav } from "@/content/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="shell">
        <div className={styles.top}>
          <div className={styles.brand}>
            {/*
              Warm ground rather than navy on purpose. The only approved
              reversed artwork (logo 3-03) has not been re-cropped like the
              full and compact marks, and the light logo must never be
              auto-inverted to fake a dark version.
            */}
            <Image
              src="/brand/caa-logo-compact.svg"
              alt={org.name}
              width={1072}
              height={755}
              className={styles.logo}
            />
            <p className={styles.heritage}>{org.heritageLine}</p>
            <p className={styles.mission}>{org.mission}</p>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {footerNav.map((column) => (
              <div key={column.heading} className={styles.column}>
                <h2 className={styles.columnHeading}>{column.heading}</h2>
                <ul>
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.link}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Required on every page: CAA is a 501(c)(3) and says so sitewide. */}
        <p className={styles.legal}>{org.taxLine}</p>

        <div className={styles.bottom}>
          <p>
            © {year} {org.name}
          </p>
          <p>{org.descriptor}</p>
        </div>
      </div>
    </footer>
  );
}
