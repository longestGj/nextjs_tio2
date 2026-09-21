import type { ReactNode } from "react";
import type { PublicProductDetail } from "@/lib/content/product-detail-types";
import type { Tio2MyGlobalChrome } from "@/lib/content/tio2-my-global-chrome-types";
import { MalaysiaGlobalFooter, MalaysiaGlobalHeader } from "../malaysia-global-chrome";
import styles from "./malaysia-product-detail.module.css";

export function MalaysiaGradeDetail({
  product: p,
  chrome,
  structuredData,
}: {
  product: PublicProductDetail;
  chrome: Tio2MyGlobalChrome;
  structuredData?: ReactNode;
}) {
  const c = (...names: string[]) => names.map((name) => styles[name]).join(" ");
  return (
    <div className={styles.site}>
      {structuredData}
      <MalaysiaGlobalHeader chrome={chrome} currentPageId="PRODUCT-000" sourcePageId={p.identity.pageId} />
      <main id="main" className={c("m350-page")} tabIndex={-1}>
        <section className={c("shell", "m350-breadcrumb")}>
          <nav aria-label="Breadcrumb">
            <ol>
              {p.breadcrumb.map((item, index) => (
                <li key={item.href} aria-current={index === p.breadcrumb.length - 1 ? "page" : undefined}>
                  {index === p.breadcrumb.length - 1 ? item.label : <a href={item.href}>{item.label}</a>}
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <section className={c("m350-hero")} aria-labelledby="grade-title">
          <div className={c("shell", "m350-hero-grid")}>
            <div className={c("m350-hero-copy")}>
              <div className={c("m350-labels")}>
                {p.hero.eyebrow.split(" · ").map((label) => <span key={label}>{label}</span>)}
              </div>
              <h1 id="grade-title">{p.seo.h1}</h1>
              <p>{p.hero.summaryLead}</p>
              <p>{p.hero.summaryBody}</p>
              <ul className={c("m350-application-links")}>
                {p.hero.proofs.map((proof) => <li key={proof}><span>{proof}</span></li>)}
              </ul>
            </div>
            <aside className={c("m350-data-summary")} aria-labelledby="grade-summary-title">
              <p className={c("eyebrow")}>{p.identity.gradeCode}</p>
              <h2 id="grade-summary-title">{p.hero.visual.label}</h2>
              <p>{p.hero.visual.technicalFile}</p>
              <p>{p.hero.visual.currentData}</p>
              <p className={c("m350-disclaimer")}>{p.hero.visual.note}</p>
              <ul>
                {p.hero.facts.map((fact) => (
                  <li key={fact.label}><strong>{fact.label}:</strong> {fact.value}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className={c("shell", "m350-section")} aria-labelledby="grade-position-heading">
          <div className={c("m350-copy-column")}>
            <p className={c("eyebrow")}>{p.positioning.eyebrow}</p>
            <h2 id="grade-position-heading">{p.positioning.heading}</h2>
            <p>{p.positioning.lead}</p>
            <p>{p.positioning.body}</p>
          </div>
          <div className={c("m350-fact-grid")}>
            {p.positioning.decisionPoints.map((text, index) => (
              <div key={text}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{text}</p></div>
            ))}
          </div>
          {p.positioning.contextualLabel && <p className={c("m350-process-link")}>{p.positioning.contextualLabel}</p>}
        </section>

        <section className={c("m350-soft-band")} aria-labelledby="grade-applications-heading">
          <div className={c("shell", "m350-section")}>
            <p className={c("eyebrow")}>{p.applications.eyebrow}</p>
            <h2 id="grade-applications-heading">{p.applications.heading}</h2>
            <p>{p.applications.intro}</p>
            <div className={c("m350-application-grid")}>
              {p.applications.items.map((item) => (
                <article key={item.title}><p className={c("eyebrow")}>{item.category}</p><h3>{item.title}</h3><p>{item.body}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={c("shell", "m350-section")} aria-labelledby="grade-evaluation-heading">
          <p className={c("eyebrow")}>{p.evaluation.eyebrow}</p>
          <h2 id="grade-evaluation-heading">{p.evaluation.heading}</h2>
          <p>{p.evaluation.intro}</p>
          <div className={c("m350-evaluation-grid")}>
            {p.evaluation.groups.map((group) => (
              <article key={group.heading}><h3>{group.heading}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>
            ))}
          </div>
          <p className={c("m350-disclaimer")}>{p.evaluation.disclaimer}</p>
        </section>

        <section className={c("m350-technical-band")} aria-labelledby="grade-technical-heading">
          <div className={c("shell", "m350-section")}>
            <p className={c("eyebrow")}>{p.technical.eyebrow}</p>
            <h2 id="grade-technical-heading">{p.technical.heading}</h2>
            <p>{p.technical.intro}</p>
            <p><strong>{p.technical.sourceLabel}</strong></p>
            <div className={c("m350-table-scroll")}>
              <table className={c("m350-technical-table")} aria-label={`${p.identity.gradeCode} typical technical data`}>
                <thead><tr>{p.technical.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>
                  {p.technical.rows.map((row, rowIndex) => (
                    <tr key={`${Object.values(row)[0]}-${rowIndex}`}>
                      {Object.values(row).map((value, columnIndex) =>
                        columnIndex === 0 ? (
                          <th key={columnIndex} scope="row" data-label={p.technical.columns[columnIndex]}>{value}</th>
                        ) : (
                          <td key={columnIndex} data-label={p.technical.columns[columnIndex]}>{value}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.technical.footnote && <p className={c("m350-technical-note")}>{p.technical.footnote}</p>}
            <p className={c("m350-technical-note")}>{p.technical.note}</p>
          </div>
        </section>

        <section className={c("m350-soft-band", "m350-market-support")} aria-labelledby="grade-market-heading">
          <div className={c("shell", "m350-section")}>
            <p className={c("eyebrow")}>{p.markets.eyebrow}</p>
            <h2 id="grade-market-heading">{p.markets.heading}</h2>
            <p>{p.markets.intro}</p>
            <ul className={c("m350-application-links")}>{p.markets.items.map((item) => <li key={item.label}><span>{item.label}</span></li>)}</ul>
            <p className={c("m350-disclaimer")}>{p.markets.note}</p>
          </div>
        </section>
      </main>
      <MalaysiaGlobalFooter chrome={chrome} sourcePageId={p.identity.pageId} />
    </div>
  );
}
