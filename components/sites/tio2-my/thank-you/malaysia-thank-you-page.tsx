"use client";

import { useLayoutEffect, useState } from "react";

import type thankYouContent from "@/content/thank-you.json";
import type { Tio2MyGlobalChrome } from "@/lib/content/tio2-my-global-chrome-types";
import {
  resolveMalaysiaThankYouRequest,
  type ThankYouRequest,
} from "@/lib/forms/thank-you-receipt";

import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import styles from "./malaysia-thank-you-page.module.css";

type ThankYouState = ThankYouRequest | "direct";
type ThankYouPageDto = typeof thankYouContent & {
  readonly globalChrome: Tio2MyGlobalChrome;
};

export function MalaysiaThankYouPage({
  content,
}: {
  readonly content: ThankYouPageDto;
}) {
  const [state, setState] = useState<ThankYouState>("direct");

  useLayoutEffect(() => {
    setState(resolveMalaysiaThankYouRequest(window.location.search));
  }, []);

  const panel = content.states[state];
  const success = state !== "direct";

  return (
    <div className={styles.page} data-site-scope="tio2-my" data-page-id={content.pageId}>
      <MalaysiaGlobalHeader
        chrome={content.globalChrome}
        currentPageId="NONE"
        sourcePageId={content.pageId}
      />
      <main className={styles.main}>
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
              <span>{content.receiptCue}</span>
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
      </main>
      <MalaysiaGlobalFooter chrome={content.globalChrome} sourcePageId={content.pageId} />
    </div>
  );
}
