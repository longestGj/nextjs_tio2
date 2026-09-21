import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

function approvedHttpsLinks(fileName: string) {
  const markdown = readFileSync(
    path.resolve("content", "application-details", fileName),
    "utf8",
  );
  const links: string[] = [];
  let cursor = 0;
  while (cursor < markdown.length) {
    const marker = markdown.indexOf("](https://", cursor);
    if (marker < 0) break;
    const start = marker + 2;
    let depth = 1;
    let index = start;
    for (; index < markdown.length; index += 1) {
      if (markdown[index] === "(") depth += 1;
      if (markdown[index] === ")") depth -= 1;
      if (depth === 0) break;
    }
    if (depth !== 0) throw new Error(`Unclosed Markdown link in ${fileName}`);
    links.push(markdown.slice(start, index));
    cursor = index + 1;
  }
  return links;
}

const pages = [
  {
    path: "/applications/titanium-dioxide-for-coatings/",
    label: "Coatings",
    eyebrow: "COATINGS APPLICATION",
    sourceFile: "coatings.md",
    h1: "Titanium Dioxide for Coatings",
    title: "Titanium Dioxide for Coatings | Grade Evaluation",
    description:
      "Compare TiO2 grades in your coating system by formulation, dispersion, film, exposure and test basis. Review Grades, documents, samples and RFQ inputs.",
    modules: 10,
    sources: 6,
    grades: ["M-350", "M-510", "M-896", "M-996", "M-2196", "M-895", "M-52", "M-2377"],
    firstAnswer:
      "Compare a candidate titanium dioxide Grade with the incumbent in the coating system that will actually use it.",
  },
  {
    path: "/applications/titanium-dioxide-for-plastics/",
    label: "Plastics",
    eyebrow: null,
    sourceFile: "plastics.md",
    h1: "Titanium Dioxide for Plastics",
    title: "Titanium Dioxide for Plastics | Grade Evaluation",
    description:
      "Compare TiO2 candidates in a defined plastic resin, process, specimen and exposure. Review Product Grades and prepare a document, sample or quotation request.",
    modules: 12,
    sources: 13,
    grades: ["M-350", "M-510", "M-200", "M-108", "M-210", "M-340", "M-886", "M-2377"],
    firstAnswer:
      "Compare TiO2 candidates in the plastic system you actually make.",
  },
  {
    path: "/applications/titanium-dioxide-for-masterbatch/",
    label: "Masterbatch",
    eyebrow: null,
    sourceFile: "masterbatch.md",
    h1: "Titanium Dioxide for Masterbatch",
    title: "Titanium Dioxide for Masterbatch Evaluation | TiO2 Malaysia",
    description:
      "Evaluate titanium dioxide for masterbatch by separating concentrate processing from final-article evidence. Review Product Grades and prepare your request.",
    modules: 11,
    sources: 4,
    grades: ["M-510", "M-200", "M-108", "M-210", "M-340", "M-886", "M-2377"],
    firstAnswer:
      "Evaluate a TiO2 pigment candidate in two connected stages: making the concentrate, then letting it down into the receiving resin and testing the final specimen.",
  },
  {
    path: "/applications/titanium-dioxide-for-printing-inks/",
    label: "Printing Inks",
    eyebrow: "PRINTING INKS APPLICATION",
    sourceFile: "printing-inks.md",
    h1: "Titanium Dioxide for Printing Inks",
    title: "Titanium Dioxide for Printing Inks | TiO2 Malaysia",
    description:
      "Compare titanium dioxide candidates in a defined white-ink and print system. Review Product Grades and prepare a document, sample or quotation request.",
    modules: 11,
    sources: 6,
    grades: ["M-350", "M-510", "M-52", "M-2377"],
    firstAnswer:
      "Compare a TiO2 candidate in the white ink and print you actually need.",
  },
  {
    path: "/applications/titanium-dioxide-for-paper/",
    label: "Paper",
    eyebrow: null,
    sourceFile: "paper.md",
    h1: "Titanium Dioxide for Paper",
    title: "Titanium Dioxide for Paper Evaluation | TiO2 Malaysia",
    description:
      "Evaluate titanium dioxide for paper in a defined system. Compare method-matched results, review Product Grades, and prepare document, sample or RFQ details.",
    modules: 11,
    sources: 7,
    grades: ["M-350", "M-2377"],
    firstAnswer:
      "Evaluate a TiO2 candidate against the paper result you need, using an identified baseline, the actual paper system and method-matched finished-paper data.",
  },
] as const;

for (const expected of pages) {
  test(`${expected.label} renders approved static content and machine semantics`, async ({
    page,
    request,
  }) => {
    const runtimeRequests: string[] = [];
    page.on("request", (request) => {
      if (/wp-json|graphql|\/api\/|wordpress/i.test(request.url())) {
        runtimeRequests.push(request.url());
      }
    });

    const response = await page.goto(expected.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(expected.h1);
    const eyebrow = page.locator("[data-application-eyebrow]");
    if (expected.eyebrow) {
      await expect(eyebrow).toHaveText(expected.eyebrow);
    } else {
      await expect(eyebrow).toHaveCount(0);
    }
    await expect(page).toHaveTitle(expected.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      expected.description,
    );
    const canonical = `https://tio2products.com${expected.path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonical,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      canonical,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      expected.title,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      expected.description,
    );
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /index/);
    await expect(robots).toHaveAttribute("content", /follow/);
    await expect(robots).not.toHaveAttribute("content", /noindex|nofollow/);

    await expect(
      page.getByRole("navigation", { name: "Breadcrumb", exact: true }).locator("li"),
    ).toHaveText(["Home", "Applications", expected.label]);
    await expect(page.locator("[data-application-module]")).toHaveCount(
      expected.modules,
    );
    const heroAnchors = page
      .locator("[data-application-module]")
      .first()
      .locator('a[href^="#"]');
    await expect(heroAnchors).toHaveCount(2);
    for (const anchor of await heroAnchors.all()) {
      const href = await anchor.getAttribute("href");
      expect(href).toMatch(/^#[a-z0-9-]+$/);
      await expect(page.locator(href!)).toHaveCount(1);
      await anchor.click();
      await expect(page.locator(href!)).toBeInViewport();
    }
    await expect(page.locator("main")).toContainText(expected.firstAnswer);
    await expect(page.locator("[data-grade-label]")).toHaveText(expected.grades);
    await expect(page.locator("[data-grade-relation]")).toHaveCount(
      expected.grades.length,
    );
    await expect(page.locator('[data-grade-relation] a[href="/products/m-350/"]')).toHaveCount(
      expected.grades.some((grade) => grade === "M-350") ? 1 : 0,
    );
    await expect(page.locator("[data-grade-relation] a")).toHaveCount(
      expected.grades.some((grade) => grade === "M-350") ? 1 : 0,
    );
    await expect(
      page.locator(
        'main a[href^="/request-documents/"], main a[href^="/request-sample/"], main a[href^="/request-a-quote/"]',
      ),
    ).toHaveCount(0);

    const sourceLinks = page.locator("[data-technical-sources] a");
    await expect(sourceLinks).toHaveCount(expected.sources);
    expect(
      await sourceLinks.evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")),
      ),
    ).toEqual(approvedHttpsLinks(expected.sourceFile));
    for (const link of await sourceLinks.all()) {
      await expect(link).toHaveAttribute("href", /^https:\/\//);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }

    const schema = JSON.parse(
      await page.locator('script[type="application/ld+json"]').innerText(),
    );
    expect(
      schema["@graph"].map((node: { "@type": string }) => node["@type"]),
    ).toEqual(["WebPage", "BreadcrumbList"]);
    expect(schema["@graph"][0]).toMatchObject({
      url: canonical,
      name: expected.h1,
      description: expected.description,
      inLanguage: "en",
    });
    expect(runtimeRequests).toEqual([]);

    const html = await (await request.get(expected.path)).text();
    expect(
      html.match(
        /APP-(?:COAT|PLAS|MB|INK|PAPER)\b|GRADE-(?:M\d+|CR\d+)\b|Gate\s*[0-9]|Finding\s+(?:ID|[A-Z]+-\d+)|readiness|[a-f0-9]{64}|D:\\|D:\/|tio2malaysia\.com/gi,
      ),
    ).toBeNull();
    const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
    expect(mainHtml).toBeDefined();
    expect(
      mainHtml?.match(
        /\/request-(?:documents|sample|a-quote)\/|\/products\/(?:m-510|m-896|m-996|m-2196|m-895|m-52|m-2377|m-200|m-108|m-210|m-340|m-886)\//g,
      ),
    ).toBeNull();
  });

  test(`${expected.label} remains substantive without JavaScript`, async (
    { browser },
    testInfo,
  ) => {
    const baseURL = testInfo.project.use.baseURL;
    if (typeof baseURL !== "string") {
      throw new Error("Playwright baseURL is required for no-JavaScript coverage.");
    }
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    });
    try {
      const page = await context.newPage();
      expect(
        (await page.goto(expected.path))?.status(),
      ).toBe(200);
      await expect(page.locator("h1")).toHaveText(expected.h1);
      await expect(page.locator("[data-application-module]")).toHaveCount(
        expected.modules,
      );
      await expect(page.locator("[data-grade-label]")).toHaveText(expected.grades);
      await expect(page.locator("[data-technical-sources] li")).toHaveCount(
        expected.sources,
      );
    } finally {
      await context.close();
    }
  });
}

test("robots and sitemap expose exactly the five indexable application pages", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("User-Agent: *");
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Sitemap: https://tio2products.com/sitemap.xml");
  expect(robots).not.toMatch(/Disallow:\s*\/applications/i);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  expect(urls).toEqual(pages.map((page) => `https://tio2products.com${page.path}`));
  expect(urls.every((url) => !url.includes("?"))).toBe(true);
  expect(sitemap).not.toContain("tio2malaysia.com");
});
