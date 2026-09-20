import type { ReactNode } from "react";
import type { MalaysiaProductHubDto } from "@/lib/content/product-hub-v01-types";
import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import { RootPageHero } from "../root-page-hero/root-page-hero";
import { ProductSelector } from "./product-selector";
import { ProductFaq } from "./product-faq";
import styles from "./malaysia-product-hub.module.css";

export function MalaysiaProductHub({
  productHub: p,
  structuredData,
}: {
  productHub: MalaysiaProductHubDto;
  structuredData?: ReactNode;
}) {
  const grades = p.directory.groups.flatMap((group) => group.grades);
  const processRoutes = p.process.routes.filter(
    (route) => p.routeReadiness[route.targetPageId],
  );
  const support = p.support.items.filter(
    (item) => p.routeReadiness[item.targetPageId],
  );
  return (
    <div className={styles.site}>
      {structuredData}
      <MalaysiaGlobalHeader
        chrome={p.globalChrome}
        currentPageId="PRODUCT-000"
        sourcePageId="PRODUCT-000"
      />
      <main className={styles.main} id="main" tabIndex={-1}>
        <RootPageHero
          pageId="PRODUCT-000"
          variant="hub-light"
          surface="open"
          className={styles.hero}
          breadcrumbLabel="Products"
          eyebrow={p.hero.eyebrow}
          heading={p.hero.h1}
          headingId="product-hero-heading"
          mobileHeadingTracking="normal"
          intro={
            <>
              <p>{p.hero.intro}</p>
              <p>{p.hero.rutileStatement}</p>
              <p className={styles.qualification}>{p.hero.qualification}</p>
            </>
          }
          actions={
            <>
              <a
                className={styles.primaryButton}
                href={p.hero.primaryAction.href}
              >
                {p.hero.primaryAction.label}
              </a>
              <a className={styles.outlineButton} href="/request-a-quote/">
                {p.hero.secondaryAction.label}
              </a>
            </>
          }
          media={
            <aside className={styles.portfolioSummary}>
              <h2>{p.hero.summary.title}</h2>
              <p>{p.hero.summary.body}</p>
              <div className={styles.summaryGrid}>
                {p.hero.summary.items.map((item) => (
                  <div key={item.label}>
                    <strong>{item.count}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          }
        />
        <section
          id="grade-selector"
          className={styles.selectorBand}
          data-module="grade-selector"
          aria-labelledby="selector-heading"
        >
          <div className={styles.shell + " " + styles.section}>
            <p className={styles.eyebrow}>{p.selector.eyebrow}</p>
            <h2 id="selector-heading">{p.selector.heading}</h2>
            <p>{p.selector.intro}</p>
            <ProductSelector
              selector={p.selector}
              grades={grades.map((grade) => ({
                gradeId: grade.gradeId,
                href: p.routeReadiness[grade.pageId] ? grade.href : null,
              }))}
            />
            <noscript>
              <p>{p.selector.failure}</p>
            </noscript>
          </div>
        </section>
        <section
          className={styles.shell + " " + styles.section}
          data-module="process"
          aria-labelledby="process-heading"
        >
          <h2 id="process-heading">{p.process.heading}</h2>
          <p className={styles.sectionIntro}>{p.process.intro}</p>
          {processRoutes.length > 0 && (
            <div className={styles.processGrid}>
              {processRoutes.map((route) => (
                <article key={route.title} className={styles.routeCard}>
                  <h3>{route.title}</h3>
                  <p>{route.body}</p>
                  <a href={route.href}>{route.actionLabel}</a>
                </article>
              ))}
            </div>
          )}
          <div className={styles.specialProcess}>
            <strong>
              {p.process.specialRow.gradeId} ·{" "}
              {p.process.specialRow.classification}
            </strong>
          </div>
        </section>
        <section
          className={styles.directoryBand}
          data-module="grade-directory"
          aria-labelledby="directory-heading"
        >
          <div className={styles.shell + " " + styles.section}>
            <h2 id="directory-heading">{p.directory.heading}</h2>
            <p className={styles.sectionIntro}>{p.directory.intro}</p>
            <div className={styles.directoryGrid}>
              {p.directory.groups.map((group) => (
                <article key={group.label} className={styles.gradeGroup}>
                  <h3>{group.label}</h3>
                  {group.grades.map((grade) => (
                    <div key={grade.gradeId} className={styles.gradeRow}>
                      <strong className={styles.gradeName}>
                        {grade.gradeId}
                      </strong>
                      <p>{grade.summary}</p>
                      {p.routeReadiness[grade.pageId] && (
                        <a
                          href={grade.href}
                          aria-label={
                            p.directory.actionLabel + " " + grade.gradeId
                          }
                        >
                          {p.directory.actionLabel} →
                        </a>
                      )}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className={styles.shell + " " + styles.section}
          aria-labelledby="evaluation-heading"
        >
          <h2 id="evaluation-heading">{p.evaluation.heading}</h2>
          <div className={styles.evaluationSteps}>
            {p.evaluation.items.map((item, i) => (
              <article key={item.title} className={styles.evaluationStep}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
        {support.length > 0 && (
          <section className={styles.supportBand} data-module="support">
            <div className={styles.shell + " " + styles.section}>
              <h2>{p.support.heading}</h2>
              <div className={styles.supportCards}>
                {support.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <a href={item.href}>{item.actionLabel}</a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        <section
          className={styles.shell + " " + styles.section}
          aria-labelledby="questions-heading"
        >
          <h2 id="questions-heading">Buyer Questions</h2>
          <ProductFaq questions={p.buyerQuestions} />
        </section>
        <section
          className={styles.finalBand}
          data-module="final-rfq"
          aria-labelledby="final-rfq-heading"
        >
          <div className={styles.shell + " " + styles.finalRfq}>
            <div>
              <h2 id="final-rfq-heading">{p.finalRfq.heading}</h2>
              <p>{p.finalRfq.body}</p>
              <p className={styles.small}>{p.finalRfq.note}</p>
            </div>
            <a className={styles.primaryButton} href="/request-a-quote/">
              {p.finalRfq.action.label}
            </a>
          </div>
        </section>
      </main>
      <MalaysiaGlobalFooter
        chrome={p.globalChrome}
        sourcePageId="PRODUCT-000"
      />
    </div>
  );
}
