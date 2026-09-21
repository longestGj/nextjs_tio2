"use client";

import { useLayoutEffect, useState } from "react";

import type thankYouContent from "@/content/thank-you.json";
import {
  resolveMalaysiaThankYouRequest,
  type ThankYouRequest,
} from "@/lib/forms/thank-you-receipt";

import styles from "./malaysia-thank-you-page.module.css";

type ThankYouState = ThankYouRequest | "direct";

export function MalaysiaThankYouPanel({
  receiptCue,
  states,
}: {
  readonly receiptCue: string;
  readonly states: typeof thankYouContent.states;
}) {
  const [state, setState] = useState<ThankYouState>("direct");

  useLayoutEffect(() => {
    setState(resolveMalaysiaThankYouRequest(window.location.search));
  }, []);

  const panel = states[state];
  const success = state !== "direct";
  return (
    <section
      className={`${styles.panel} ${success ? styles.success : styles.direct}`}
      data-thank-you-panel={state}
      aria-labelledby="thank-you-heading"
    >
      {success ? (
        <div className={styles.receiptCue}>
          <span className={styles.receiptIcon} aria-hidden="true">
            ✓
          </span>
          <span>{receiptCue}</span>
        </div>
      ) : null}
      <h1 id="thank-you-heading">{panel.heading}</h1>
      <p>{panel.body}</p>
      <div
        className={`${styles.actions} ${panel.actions.length === 3 ? styles.threeActions : ""}`}
      >
        {panel.actions.map((action, index) => (
          <a
            className={`${styles.action} ${index === 0 ? styles.primary : ""}`}
            href={action.href}
            key={action.label}
          >
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
