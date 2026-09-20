"use client";

import { useId, useState, useSyncExternalStore } from "react";

import styles from "./malaysia-homepage.module.css";

const subscribe = () => () => {};

export function ResponsiveProductGroups({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}

export function ResponsiveProductGroup({
  children,
  count,
  title,
}: {
  readonly children: React.ReactNode;
  readonly count: number;
  readonly title: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const expanded = !hydrated || mobileOpen;
  const panelId = useId();

  return (
    <div
      className={styles.productGroup}
      data-product-group
      data-mobile-open={expanded}
    >
      <button
        aria-controls={panelId}
        aria-expanded={expanded}
        aria-label={`${title}, ${count} grades, ${expanded ? "collapse" : "expand grades"}`}
        className={styles.productGroupToggle}
        data-product-disclosure
        disabled={!hydrated}
        onClick={() => setMobileOpen((open) => !open)}
        type="button"
      >
        <strong>{title}</strong>
        <span>
          {count} · {expanded ? "Collapse" : "Expand grades"}{" "}
          <b aria-hidden="true">{expanded ? "−" : "+"}</b>
        </span>
      </button>
      <div className={styles.productGroupContent} id={panelId}>
        {children}
      </div>
    </div>
  );
}
