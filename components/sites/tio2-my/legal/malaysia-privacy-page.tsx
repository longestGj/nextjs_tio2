import { Fragment, type ReactNode } from "react";

import type {
  MalaysiaPrivacyPageDto,
  PrivacyBlock,
} from "@/lib/content/privacy-types";

import { MalaysiaCookieSettingsTrigger } from "../consent/malaysia-cookie-settings";
import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import styles from "./malaysia-privacy-page.module.css";

const tokenPattern =
  /(\{\{privacyEmail\}\}|\{\{privacyBm\}\}|\{\{cookiePolicy\}\})/g;

function RichText({ text }: { readonly text: string }) {
  return text.split(tokenPattern).map((part, index): ReactNode => {
    if (part === "{{privacyEmail}}") {
      return (
        <a href="mailto:info@tio2malaysia.com" key={`${part}-${index}`}>
          info@tio2malaysia.com
        </a>
      );
    }
    if (part === "{{privacyBm}}") {
      return (
        <a href="/privacy-policy-bm/" key={`${part}-${index}`}>
          Bahasa Malaysia
        </a>
      );
    }
    if (part === "{{cookiePolicy}}") {
      return (
        <a href="/cookie-policy/" key={`${part}-${index}`}>
          Cookie Policy
        </a>
      );
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function PrivacyBlockView({ block }: { readonly block: PrivacyBlock }) {
  switch (block.type) {
    case "subheading":
      return <h3>{block.text}</h3>;
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "address":
      return (
        <address>
          {block.lines.map((line) => (
            <Fragment key={line}>
              {line}
              <br />
            </Fragment>
          ))}
        </address>
      );
    case "paragraph":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
  }
}

export function MalaysiaPrivacyPage({
  privacy,
  structuredData,
}: {
  readonly privacy: MalaysiaPrivacyPageDto;
  readonly structuredData?: ReactNode;
}) {
  return (
    <div className={styles.site} data-site-scope="tio2-my" data-page-id={privacy.pageId}>
      {structuredData}
      <MalaysiaGlobalHeader
        chrome={privacy.globalChrome}
        currentPageId="NONE"
        sourcePageId={privacy.pageId}
      />
      <main className={styles.main}>
        <header className={styles.hero}>
          <h1>{privacy.title}</h1>
          <p className={styles.updated}>{privacy.updated}</p>
          {privacy.intro.map((paragraph) => (
            <p key={paragraph}>
              <RichText text={paragraph} />
            </p>
          ))}
          <div className={styles.actions}>
            <a href={`mailto:${privacy.contact.email}`}>
              {privacy.contact.emailLabel}
            </a>
            <MalaysiaCookieSettingsTrigger>
              {privacy.contact.cookieLabel}
            </MalaysiaCookieSettingsTrigger>
          </div>
        </header>

        <div className={styles.layout}>
          <nav className={styles.toc} aria-labelledby="privacy-toc-heading">
            <p>{privacy.tocEyebrow}</p>
            <h2 id="privacy-toc-heading">{privacy.tocHeading}</h2>
            <ol>
              {privacy.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
          <article className={styles.policy}>
            {privacy.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.heading}</h2>
                {section.blocks.map((block, index) => (
                  <PrivacyBlockView block={block} key={`${block.type}-${index}`} />
                ))}
              </section>
            ))}
          </article>
        </div>

        <aside className={styles.contact}>
          <a href={`mailto:${privacy.contact.email}`}>
            {privacy.contact.emailLabel}
          </a>
          <MalaysiaCookieSettingsTrigger>
            {privacy.contact.cookieLabel}
          </MalaysiaCookieSettingsTrigger>
        </aside>
      </main>
      <MalaysiaGlobalFooter chrome={privacy.globalChrome} sourcePageId={privacy.pageId} />
    </div>
  );
}
