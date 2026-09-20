import type { ReactNode } from "react";
import type { MalaysiaProductDetailDto } from "@/lib/content/product-detail-v01-types";
import {
  MalaysiaGlobalHeader,
  MalaysiaGlobalFooter,
} from "../malaysia-global-chrome";
import styles from "./malaysia-product-detail.module.css";

export function MalaysiaProductDetail({
  product: p,
  structuredData,
}: {
  product: MalaysiaProductDetailDto;
  structuredData?: ReactNode;
}) {
  const c = (...names: string[]) => names.map((name) => styles[name]).join(" ");
  const rows = p.technical.rows.filter((row) => row.status === "active");
  return (
    <div className={styles.site}>
      {structuredData}
      <MalaysiaGlobalHeader
        chrome={p.globalChrome}
        currentPageId="PRODUCT-000"
        sourcePageId="GRADE-M350"
      />
      <main id="main" className={c("m350-page")} tabIndex={-1}>
        <section className={c("shell", "m350-breadcrumb")}>
          <nav aria-label="Breadcrumb">
            <ol>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/products/">Products</a>
              </li>
              <li aria-current="page">M-350</li>
            </ol>
          </nav>
        </section>
        <section className={c("m350-hero")} aria-labelledby="m350-title">
          <div className={c("shell", "m350-hero-grid")}>
            <div className={c("m350-hero-copy")}>
              <div className={c("m350-labels")}>
                <span>{p.hero.category}</span>
                <span>{p.hero.process}</span>
              </div>
              <h1 id="m350-title">{p.hero.heading}</h1>
              {p.hero.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            <aside
              className={c("m350-data-summary")}
              aria-labelledby="m350-summary-title"
            >
              <p className={c("eyebrow")}>M-350</p>
              <h2 id="m350-summary-title">{p.hero.summaryTitle}</h2>
              <ul>
                {p.hero.summary.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
        <section
          className={c("shell", "m350-section")}
          aria-labelledby="m350-position-heading"
        >
          <div className={c("m350-copy-column")}>
            <h2 id="m350-position-heading">{p.positioning.heading}</h2>
            {p.positioning.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <div className={c("m350-fact-grid")}>
            {p.positioning.facts.map((text, i) => (
              <div key={text}>
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className={c("m350-process-link")}>{p.positioning.processLabel}</p>
        </section>
        <section
          className={c("m350-soft-band")}
          aria-labelledby="m350-applications-heading"
        >
          <div className={c("shell", "m350-section")}>
            <h2 id="m350-applications-heading">{p.applications.heading}</h2>
            <div className={c("m350-application-grid")}>
              {p.applications.items.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
              {p.applications.paper.status === "active" && (
                <article className={c("m350-paper-path")}>
                  <h3>{p.applications.paper.title}</h3>
                  <p>{p.applications.paper.body}</p>
                </article>
              )}
            </div>
            <ul className={c("m350-application-links")}>
              {p.applications.labels
                .filter(
                  (_, i) => i < 3 || p.applications.paper.status === "active",
                )
                .map((label) => (
                  <li key={label}>
                    <span>{label}</span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
        <section
          className={c("shell", "m350-section")}
          aria-labelledby="m350-evaluation-heading"
        >
          <h2 id="m350-evaluation-heading">{p.evaluation.heading}</h2>
          <div className={c("m350-evaluation-grid")}>
            {p.evaluation.groups.map((group) => (
              <article key={group.heading}>
                <h3>{group.heading}</h3>
                <ul>
                  {group.items.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className={c("m350-disclaimer")}>{p.evaluation.disclaimer}</p>
        </section>
        <section
          className={c("m350-technical-band")}
          aria-labelledby="m350-technical-heading"
        >
          <div className={c("shell", "m350-section")}>
            <p className={c("eyebrow")}>{p.technical.heading}</p>
            <h2 id="m350-technical-heading">{p.technical.heading}</h2>
            <div className={c("m350-technical-layout")}>
              <div>
                <div className={c("m350-table-scroll")}>
                  <table
                    className={c("m350-technical-table")}
                    aria-label="M-350 typical technical data"
                  >
                    <thead>
                      <tr>
                        {p.technical.columns.map((label) => (
                          <th key={label} scope="col">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.property}>
                          <th scope="row" data-label={p.technical.columns[0]}>
                            {row.property}
                          </th>
                          <td data-label={p.technical.columns[1]}>
                            {row.standard}
                          </td>
                          <td data-label={p.technical.columns[2]}>
                            {row.typical}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={c("m350-technical-note")}>{p.technical.note}</p>
              </div>
            </div>
          </div>
        </section>
        <section
          className={c("m350-soft-band", "m350-market-support")}
          aria-labelledby="m350-market-heading"
        >
          <div className={c("shell", "m350-section")}>
            <p className={c("eyebrow")}>Market support</p>
            <h2 id="m350-market-heading">{p.markets.heading}</h2>
            <p>{p.markets.intro}</p>
            <p className={c("m350-disclaimer")}>{p.markets.disclaimer}</p>
          </div>
        </section>
      </main>
      <MalaysiaGlobalFooter chrome={p.globalChrome} sourcePageId="GRADE-M350" />
    </div>
  );
}
