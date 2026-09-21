export type ProductDetailCandidate = {
  pageId: string;
  gradeCode: string;
  slug: string;
  path: string;
  contractFile: string;
  sha256: string;
};

export type ProductDetailContract = {
  identity: Record<string, string>;
  releaseControls: { indexingAuthorized: boolean; sitemapAuthorized: boolean };
  seo: { title: string; description: string; h1: string; canonical: string; language: string; robots?: string };
  breadcrumb: Array<{ targetPageId: string; label: string; href: string }>;
  hero: Record<string, unknown> & { actions?: unknown[] };
  positioning: Record<string, unknown> & { contextualLink?: unknown };
  applications: Record<string, unknown> & { items: Array<Record<string, unknown>> };
  evaluation: Record<string, unknown>;
  technical: Record<string, unknown> & { columns: string[]; rows: Array<Record<string, string>>; action?: unknown };
  markets: Record<string, unknown> & { items: Array<{ label: string; targetPageId?: string; href?: string }> };
};

export type PublicProductDetail = {
  identity: { pageId: string; siteScope: string; locale: string; gradeCode: string; slug: string; path: string };
  seo: { title: string; description: string; h1: string; canonical: string; language: string; robots: "noindex,nofollow" };
  breadcrumb: Array<{ label: string; href: string }>;
  hero: {
    eyebrow: string;
    summaryLead: string;
    summaryBody: string;
    proofs: string[];
    visual: { label: string; technicalFile: string; currentData: string; note: string };
    facts: Array<{ label: string; value: string }>;
  };
  positioning: { eyebrow: string; heading: string; lead: string; body: string; decisionPoints: string[]; contextualLabel: string | null };
  applications: { eyebrow: string; heading: string; intro: string; items: Array<{ category: string; title: string; body: string }> };
  evaluation: { eyebrow: string; heading: string; intro: string; groups: Array<{ heading: string; items: string[] }>; disclaimer: string };
  technical: {
    eyebrow: string;
    heading: string;
    intro: string;
    sourceLabel: string;
    columns: string[];
    rows: Array<Record<string, string>>;
    footnote?: string;
    note: string;
  };
  markets: { eyebrow: string; heading: string; intro: string; items: Array<{ label: string }>; note: string };
};

export type ProductDetailRegistryEntry = ProductDetailCandidate & { page: PublicProductDetail };
