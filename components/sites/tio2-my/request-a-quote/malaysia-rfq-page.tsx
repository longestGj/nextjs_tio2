import type { ReactNode } from "react";

import type { MalaysiaRfqPageDto } from "@/lib/content/rfq-types";

import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import { MalaysiaRfqForm } from "./malaysia-rfq-form";
import styles from "./malaysia-rfq-page.module.css";

export function MalaysiaRfqPage({
  content,
  accessKey,
  receiverAvailable,
  structuredData,
}: {
  readonly content: MalaysiaRfqPageDto;
  readonly accessKey: string | undefined;
  readonly receiverAvailable: boolean;
  readonly structuredData?: ReactNode;
}) {
  return (
    <div className={styles.site} data-site-scope="tio2-my" data-page-id={content.pageId}>
      {structuredData}
      <MalaysiaGlobalHeader chrome={content.globalChrome} currentPageId="NONE" sourcePageId={content.pageId} />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">{content.breadcrumb.home}</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{content.breadcrumb.current}</span>
        </nav>
        <section className={styles.hero} aria-labelledby="rfq-h1">
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
          <h1 id="rfq-h1">{content.hero.heading}</h1>
          <p>{content.hero.body}</p>
        </section>
        <section className={styles.formSurface} aria-labelledby="rfq-form-heading">
          <div className={styles.formHeading}>
            <h2 id="rfq-form-heading">{content.form.heading}</h2>
            <p>{content.form.intro}</p>
          </div>
          <MalaysiaRfqForm
            form={content.form}
            accessKey={accessKey}
            receiverAvailable={receiverAvailable}
            privacyPolicyHref="/privacy-policy/"
          />
        </section>
        <aside className={styles.otherRequests} aria-labelledby="rfq-other-heading">
          <h2 id="rfq-other-heading">{content.otherRequests.heading}</h2>
          <p>{content.otherRequests.body}</p>
          <div>
            {content.otherRequests.links.map((link) => (
              <a href={link.href} key={link.href}>{link.label} <span aria-hidden="true">→</span></a>
            ))}
          </div>
        </aside>
      </main>
      <MalaysiaGlobalFooter chrome={content.globalChrome} sourcePageId={content.pageId} />
    </div>
  );
}
