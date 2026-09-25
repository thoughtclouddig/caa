"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { org, primaryNav, primaryCta, memberArea } from "@/content/site";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  /*
   * Inside the member area and the admin tools, the public navigation is
   * noise: two full navigations stacked, and a "Member Login" link and a
   * "Join" button offered to somebody already signed in. The header
   * collapses to the mark and one way back out, and the section
   * navigation underneath does the work.
   */
  const signedInArea =
    pathname === "/portal" || pathname.startsWith("/portal/") ||
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (signedInArea) {
    return (
      <header className={`${styles.header} ${styles.headerQuiet}`}>
        <div className={`shell ${styles.bar}`}>
          <Link href="/" className={styles.brand} aria-label={`${org.name} — home`}>
            <Image
              src="/brand/caa-logo-compact.svg"
              alt={org.name}
              width={1072}
              height={755}
              className={styles.logo}
              priority
            />
          </Link>
          <Link href="/" className={styles.exit}>
            View the public site
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={`${org.name} — home`}>
          {/* Compact lockup: the approved mark for headers and wide, short
              spaces. Placed as supplied artwork, never redrawn. */}
          <Image
            src="/brand/caa-logo-compact.svg"
            alt={org.name}
            width={1072}
            height={755}
            className={styles.logo}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">
            {open ? "Close menu" : "Open menu"}
          </span>
          <span aria-hidden="true" className={styles.toggleIcon}>
            {open ? "✕" : "☰"}
          </span>
        </button>

        <div
          id="primary-navigation"
          className={`${styles.nav} ${open ? styles.navOpen : ""}`}
        >
          <nav aria-label="Primary">
            <ul className={styles.navList}>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link
              href={memberArea.href}
              className={styles.memberLink}
              onClick={() => setOpen(false)}
            >
              {memberArea.label}
            </Link>
            <Link
              href={primaryCta.href}
              className="btn btn--primary"
              onClick={() => setOpen(false)}
            >
              {primaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
