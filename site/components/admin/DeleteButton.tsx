"use client";

import { useState, useTransition } from "react";
import styles from "./AdminUI.module.css";

/**
 * Deletion asks once, in place.
 *
 * A browser confirm() is easy to dismiss without reading. Turning the
 * button into an explicit "Delete / Cancel" pair costs one extra click and
 * makes the destructive option something you have to aim at.
 */
export default function DeleteButton({
  action,
  label = "Delete",
  confirmLabel = "Delete for good",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button type="button" className={styles.danger} onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className={styles.confirmRow}>
      <button
        type="button"
        className={styles.dangerSolid}
        disabled={pending}
        onClick={() => startTransition(() => { void action(); })}
      >
        {pending ? "Deleting…" : confirmLabel}
      </button>
      <button type="button" className={styles.quiet} onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  );
}
