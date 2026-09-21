import type { ReactNode } from "react";

import type { ApplicationDetailPage } from "@/lib/content/application-detail-pages";
import type { Tio2MyGlobalChrome } from "@/lib/content/tio2-my-global-chrome-types";

import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import styles from "./malaysia-application-detail.module.css";

type Block =
  | { readonly type: "heading"; readonly text: string }
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "list"; readonly ordered: boolean; readonly items: readonly string[] }
  | {
      readonly type: "table";
      readonly headers: readonly string[];
      readonly rows: readonly (readonly string[])[];
    };

interface DocumentSection {
  readonly heading: string;
  readonly id: string;
  readonly blocks: readonly Block[];
}

function cleanText(value: string) {
  return value.replace(/[*`]/g, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isStructuralLine(line: string) {
  return (
    line === "" ||
    line.startsWith("### ") ||
    /^[-*] /.test(line) ||
    /^\d+\. /.test(line) ||
    line.startsWith("|") ||
    /^<a id="[^"]+"><\/a>$/.test(line)
  );
}

function parseBlocks(lines: readonly string[]): Block[] {
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line === "" || /^<a id="[^"]+"><\/a>$/.test(line)) {
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "heading", text: line.slice(4).trim() });
      index += 1;
      continue;
    }
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const cells = tableLines.map((row) =>
        row
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim()),
      );
      blocks.push({
        type: "table",
        headers: cells[0] ?? [],
        rows: cells.slice(2),
      });
      continue;
    }
    const unordered = /^[-*] /.test(line);
    const ordered = /^\d+\. /.test(line);
    if (unordered || ordered) {
      const items: string[] = [];
      const itemPattern = ordered ? /^\d+\. / : /^[-*] /;
      while (index < lines.length && itemPattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(itemPattern, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      !isStructuralLine(lines[index].trim()) &&
      !lines[index].trim().startsWith("## ")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

function parseDocument(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const h1Index = lines.findIndex((line) => line.startsWith("# "));
  if (h1Index < 0) throw new Error("Application detail copy requires one H1.");
  const h1 = lines[h1Index].slice(2).trim();
  const headingIndexes = lines
    .map((line, index) => (line.startsWith("## ") ? index : -1))
    .filter((index) => index >= 0);
  const firstHeading = headingIndexes[0] ?? lines.length;
  const hero = parseBlocks(lines.slice(h1Index + 1, firstHeading));
  const sections = headingIndexes.map((headingIndex, index): DocumentSection => {
    let previousIndex = headingIndex - 1;
    while (previousIndex >= 0 && lines[previousIndex].trim() === "") {
      previousIndex -= 1;
    }
    const previousLine = lines[previousIndex]?.trim() ?? "";
    const anchor = previousLine.match(/^<a id="([^"]+)"><\/a>$/)?.[1];
    const heading = lines[headingIndex].slice(3).trim();
    return {
      heading,
      id: anchor ?? slugify(heading),
      blocks: parseBlocks(
        lines.slice(headingIndex + 1, headingIndexes[index + 1] ?? lines.length),
      ),
    };
  });
  return { h1, hero, sections };
}

function isAllowedInternalLink(href: string) {
  return (
    href.startsWith("#") ||
    href === "/products/" ||
    href === "/products/m-350/" ||
    href === "/applications/titanium-dioxide-for-plastics/" ||
    href === "/applications/titanium-dioxide-for-masterbatch/"
  );
}

function renderInline(value: string): ReactNode[] {
  const token = /(\[[^\]]+\]\((?:[^()]|\([^()]*\))+\)|\*[^*]+\*|`[^`]+`)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of value.matchAll(token)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(value.slice(cursor, start));
    const fragment = match[0];
    const link = fragment.match(/^\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)$/);
    if (link) {
      const [, rawLabel, href] = link;
      const label = cleanText(rawLabel);
      if (/^https:\/\//.test(href)) {
        nodes.push(
          <a href={href} key={`${start}-${href}`} rel="noopener noreferrer" target="_blank">
            {label}
          </a>,
        );
      } else if (isAllowedInternalLink(href)) {
        nodes.push(
          <a href={href} key={`${start}-${href}`}>
            {label}
          </a>,
        );
      } else if (href.startsWith("/request-")) {
        nodes.push(<strong key={`${start}-request-label`}>{label}</strong>);
      }
    } else if (fragment.startsWith("*")) {
      nodes.push(<em key={start}>{fragment.slice(1, -1)}</em>);
    } else {
      nodes.push(<code key={start}>{fragment.slice(1, -1)}</code>);
    }
    cursor = start + fragment.length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function ContentTable({
  block,
  gradeTable,
}: {
  readonly block: Extract<Block, { type: "table" }>;
  readonly gradeTable: boolean;
}) {
  return (
    <div className={styles.tableScroll}>
      <table>
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr data-grade-relation={gradeTable ? "" : undefined} key={`${rowIndex}-${row[0]}`}>
              {row.map((cell, cellIndex) => (
                <td data-label={cleanText(block.headers[cellIndex] ?? "")} key={cellIndex}>
                  {gradeTable && cellIndex === 0 ? (
                    <span data-grade-label>{cleanText(cell)}</span>
                  ) : (
                    renderInline(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Blocks({
  blocks,
  gradeTable = false,
  hero = false,
}: {
  readonly blocks: readonly Block[];
  readonly gradeTable?: boolean;
  readonly hero?: boolean;
}) {
  return blocks.map((block, index) => {
    if (block.type === "heading") {
      return <h3 key={`heading-${index}`}>{block.text}</h3>;
    }
    if (block.type === "paragraph") {
      if (/^\[[^\]]+\]\(\/request-[^)]+\)$/.test(block.text)) {
        return null;
      }
      const actionParagraph = hero && /\]\(#[^)]+\)/.test(block.text);
      return (
        <p className={actionParagraph ? styles.heroActions : undefined} key={`paragraph-${index}`}>
          {renderInline(block.text)}
        </p>
      );
    }
    if (block.type === "list") {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List key={`list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`${itemIndex}-${item.slice(0, 30)}`}>{renderInline(item)}</li>
          ))}
        </List>
      );
    }
    return <ContentTable block={block} gradeTable={gradeTable} key={`table-${index}`} />;
  });
}

export function MalaysiaApplicationDetail({
  chrome,
  page,
  structuredData,
}: {
  readonly chrome: Tio2MyGlobalChrome;
  readonly page: ApplicationDetailPage;
  readonly structuredData: ReactNode;
}) {
  const document = parseDocument(page.markdown);
  if (document.h1 !== page.h1) {
    throw new Error(`Application copy H1 does not match route metadata for ${page.slug}.`);
  }

  return (
    <div className={styles.site}>
      {structuredData}
      <MalaysiaGlobalHeader
        chrome={chrome}
        currentPageId="APP-000"
        sourcePageId="APP-000"
      />
      <main className={styles.main} id="main" tabIndex={-1}>
        <section className={styles.hero} data-application-module>
          <div className={styles.shell}>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumb}>
                <li><a href="/">Home</a></li>
                <li><a href="/applications/">Applications</a></li>
                <li aria-current="page">{page.label}</li>
              </ol>
            </nav>
            {page.eyebrow ? (
              <p className={styles.eyebrow} data-application-eyebrow>
                {page.eyebrow}
              </p>
            ) : null}
            <h1>{page.h1}</h1>
            <div className={styles.heroCopy}>
              <Blocks blocks={document.hero} hero />
            </div>
          </div>
        </section>

        {document.sections.map((section, index) => {
          const gradeTable = /grades to review/i.test(section.heading);
          const technicalSources = /technical sources/i.test(section.heading);
          const headingId = `${section.id}-heading`;
          return (
            <section
              aria-labelledby={headingId}
              className={index % 2 === 0 ? styles.section : `${styles.section} ${styles.soft}`}
              data-application-module
              data-technical-sources={technicalSources ? "" : undefined}
              id={section.id}
              key={section.id}
            >
              <div className={styles.shell}>
                <h2 id={headingId}>{section.heading}</h2>
                <Blocks blocks={section.blocks} gradeTable={gradeTable} />
              </div>
            </section>
          );
        })}
      </main>
      <MalaysiaGlobalFooter chrome={chrome} sourcePageId="APP-000" />
    </div>
  );
}
