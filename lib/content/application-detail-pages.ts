import { readFileSync } from "node:fs";
import { join } from "node:path";

const origin = "https://tio2products.com";

export type ApplicationDetailSlug =
  | "titanium-dioxide-for-coatings"
  | "titanium-dioxide-for-plastics"
  | "titanium-dioxide-for-masterbatch"
  | "titanium-dioxide-for-printing-inks"
  | "titanium-dioxide-for-paper";

export interface ApplicationDetailPage {
  readonly slug: ApplicationDetailSlug;
  readonly label: string;
  readonly eyebrow: string | null;
  readonly h1: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly markdown: string;
}

function loadMarkdown(fileName: string) {
  return readFileSync(
    join(process.cwd(), "content", "application-details", fileName),
    "utf8",
  );
}

function definePage(
  slug: ApplicationDetailSlug,
  label: string,
  eyebrow: string | null,
  h1: string,
  title: string,
  description: string,
  fileName: string,
): ApplicationDetailPage {
  return {
    slug,
    label,
    eyebrow,
    h1,
    title,
    description,
    canonical: `${origin}/applications/${slug}/`,
    markdown: loadMarkdown(fileName),
  };
}

export const applicationDetailPages = [
  definePage(
    "titanium-dioxide-for-coatings",
    "Coatings",
    "COATINGS APPLICATION",
    "Titanium Dioxide for Coatings",
    "Titanium Dioxide for Coatings | Grade Evaluation",
    "Compare TiO2 grades in your coating system by formulation, dispersion, film, exposure and test basis. Review Grades, documents, samples and RFQ inputs.",
    "coatings.md",
  ),
  definePage(
    "titanium-dioxide-for-plastics",
    "Plastics",
    null,
    "Titanium Dioxide for Plastics",
    "Titanium Dioxide for Plastics | Grade Evaluation",
    "Compare TiO2 candidates in a defined plastic resin, process, specimen and exposure. Review Product Grades and prepare a document, sample or quotation request.",
    "plastics.md",
  ),
  definePage(
    "titanium-dioxide-for-masterbatch",
    "Masterbatch",
    null,
    "Titanium Dioxide for Masterbatch",
    "Titanium Dioxide for Masterbatch Evaluation | TiO2 Malaysia",
    "Evaluate titanium dioxide for masterbatch by separating concentrate processing from final-article evidence. Review Product Grades and prepare your request.",
    "masterbatch.md",
  ),
  definePage(
    "titanium-dioxide-for-printing-inks",
    "Printing Inks",
    "PRINTING INKS APPLICATION",
    "Titanium Dioxide for Printing Inks",
    "Titanium Dioxide for Printing Inks | TiO2 Malaysia",
    "Compare titanium dioxide candidates in a defined white-ink and print system. Review Product Grades and prepare a document, sample or quotation request.",
    "printing-inks.md",
  ),
  definePage(
    "titanium-dioxide-for-paper",
    "Paper",
    null,
    "Titanium Dioxide for Paper",
    "Titanium Dioxide for Paper Evaluation | TiO2 Malaysia",
    "Evaluate titanium dioxide for paper in a defined system. Compare method-matched results, review Product Grades, and prepare document, sample or RFQ details.",
    "paper.md",
  ),
] as const satisfies readonly ApplicationDetailPage[];

export function applicationDetailPage(slug: ApplicationDetailSlug) {
  const page = applicationDetailPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Unknown application detail route: ${slug}`);
  return page;
}
