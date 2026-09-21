import type { ReactNode } from "react";

import type { MalaysiaApplicationsHubDto } from "@/lib/content/applications-v01-types";

import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import { RootPageHero } from "../root-page-hero/root-page-hero";
import styles from "./malaysia-applications-hub.module.css";

export function MalaysiaApplicationsHub({
  applications: p,
  structuredData,
}: {
  readonly applications: MalaysiaApplicationsHubDto;
  readonly structuredData?: ReactNode;
}) {
  const grades = new Map(p.grades.map((grade) => [grade.pageId, grade]));
  const hasGradeRoute = p.applications.collections.some((collection) =>
    collection.gradePageIds.some((pageId) => p.routeReadiness[pageId]),
  );
  const hasApplicationRoute = p.applications.collections.some(
    (collection) =>
      collection.childAction &&
      p.routeReadiness[collection.childAction.targetPageId],
  );
  const routeSentence = hasGradeRoute
    ? hasApplicationRoute
      ? p.applications.intro.both
      : p.applications.intro.gradeOnly
    : hasApplicationRoute
      ? p.applications.intro.applicationOnly
      : "";
  const procurement = p.procurement.items.filter(
    (item) => p.routeReadiness[item.targetPageId],
  );
  const rfqReady = p.routeReadiness[p.finalRfq.targetPageId];

  return (
    <div className={styles.site}>
      {structuredData}
      <MalaysiaGlobalHeader
        chrome={p.globalChrome}
        currentPageId="APP-000"
        sourcePageId="APP-000"
      />
      <main className={styles.main} id="main" tabIndex={-1}>
        <RootPageHero
          pageId="APP-000"
          variant="hub-light"
          surface="open"
          className={styles.hero}
          breadcrumbLabel={p.breadcrumb.currentLabel}
          eyebrow={p.hero.eyebrow}
          heading={p.hero.h1}
          headingId="applications-hero-heading"
          moduleName="M1-HERO"
          mobileHeadingTracking="normal"
          intro={<p>{p.hero.body}</p>}
          actions={
            <>
              <a className={styles.primaryButton} href={p.hero.primaryAction.href}>
                {p.hero.primaryAction.label}
              </a>
              {rfqReady ? (
                <a className={styles.secondaryButton} href={p.hero.secondaryAction.href}>
                  {p.hero.secondaryAction.label}
                </a>
              ) : null}
            </>
          }
          media={
            <aside className={styles.heroIndex} aria-labelledby="application-index-heading">
              <h2 id="application-index-heading">{p.hero.indexHeading}</h2>
              <div className={styles.heroLinks}>
                {p.applications.collections.map((collection) => (
                  <a key={collection.id} href={`#application-${collection.id}`}>
                    {collection.title}
                    <span aria-hidden="true">↓</span>
                  </a>
                ))}
              </div>
            </aside>
          }
        />

        <section
          className={styles.band}
          id="application-selector"
          data-module="M2-APPLICATION_PATHS"
          aria-labelledby="applications-heading"
        >
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionIntro}>
              <h2 id="applications-heading">{p.applications.heading}</h2>
              <p>
                {p.applications.intro.neutral}{" "}
                <span data-route-sentence>{routeSentence}</span>
              </p>
            </div>
            <div className={styles.applicationGrid}>
              {p.applications.collections.map((collection) => (
                <article
                  className={styles.applicationCard}
                  data-application-card
                  id={`application-${collection.id}`}
                  key={collection.id}
                >
                  <h3>{collection.title}</h3>
                  <p>{collection.scope}</p>
                  <p className={styles.gradeLabel}>{collection.gradeLabel}</p>
                  <ul className={styles.gradeList}>
                    {collection.gradePageIds.map((pageId) => {
                      const grade = grades.get(pageId);
                      if (!grade) throw new Error(`Unknown grade relation: ${pageId}`);
                      return (
                        <li data-grade key={grade.label}>
                          {p.routeReadiness[pageId] ? (
                            <a href={grade.href}>{grade.label}</a>
                          ) : (
                            <span>{grade.label}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {collection.childAction &&
                  p.routeReadiness[collection.childAction.targetPageId] ? (
                    <a
                      className={styles.textAction}
                      data-application-action
                      href={collection.childAction.href}
                    >
                      {collection.childAction.label}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.shell} ${styles.section}`}
          data-module="M3-EVALUATION_GUIDE"
          aria-labelledby="evaluation-heading"
        >
          <h2 id="evaluation-heading">{p.evaluation.heading}</h2>
          <div className={styles.steps}>
            {p.evaluation.items.map((item, index) => (
              <article data-evaluation-step key={item.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {procurement.length > 0 ? (
          <section
            className={styles.band}
            data-module="M4-PROCUREMENT_PATHS"
            aria-labelledby="procurement-heading"
          >
            <div className={`${styles.shell} ${styles.section}`}>
              <h2 id="procurement-heading">{p.procurement.heading}</h2>
              <div className={styles.procurementGrid}>
                {procurement.map((item) => (
                  <article data-procurement-card key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <a className={styles.textAction} href={item.href}>
                      {item.actionLabel}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {rfqReady ? (
          <section
            className={styles.finalBand}
            data-module="M5-FINAL-RFQ"
            aria-labelledby="final-rfq-heading"
          >
            <div className={`${styles.shell} ${styles.finalCta}`}>
              <div>
                <h2 id="final-rfq-heading">{p.finalRfq.heading}</h2>
                {p.finalRfq.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <a className={styles.primaryButton} href={p.finalRfq.action.href}>
                {p.finalRfq.action.label}
              </a>
            </div>
          </section>
        ) : null}
      </main>
      <MalaysiaGlobalFooter chrome={p.globalChrome} sourcePageId="APP-000" />
    </div>
  );
}
