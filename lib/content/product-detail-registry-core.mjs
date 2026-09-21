const publicOrigin = "https://tio2products.com";
const legacyOrigin = "https://tio2malaysia.com";

function fail(message) {
  throw new Error(`Product detail contract: ${message}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label} identity mismatch: expected ${expected}, received ${actual}`);
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} is required`);
}

function withoutKeys(value, keys) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}

export function createPublicProductDetail(contract, expected) {
  if (!contract || typeof contract !== "object") fail("contract is required");
  const identity = contract.identity ?? {};
  assertEqual(identity.pageId, expected.pageId, "page ID");
  assertEqual(identity.gradeCode, expected.gradeCode, "grade code");
  assertEqual(identity.slug, expected.slug, "slug");
  assertEqual(identity.path, expected.path, "path");
  assertEqual(identity.siteScope, "tio2-my", "site scope");
  assertEqual(identity.locale, "en", "locale");
  assertEqual(identity.templateVersion, "product-detail-v1", "template version");
  assertEqual(identity.schemaVersion, "product-detail-v0.1-malaysia", "schema version");
  assertEqual(identity.recordState, "approved_for_preview", "record state");
  assertEqual(contract.releaseControls?.indexingAuthorized, false, "indexing authorization");
  assertEqual(contract.releaseControls?.sitemapAuthorized, false, "sitemap authorization");

  const expectedLegacyCanonical = legacyOrigin + expected.path;
  assertEqual(contract.seo?.canonical, expectedLegacyCanonical, "canonical path");
  if (contract.seo.robots !== undefined) {
    assertEqual(contract.seo.robots.replace(/\s/g, ""), "noindex,nofollow", "robots");
  }
  for (const [key, value] of Object.entries({ title: contract.seo?.title, description: contract.seo?.description, h1: contract.seo?.h1 })) {
    requireText(value, `SEO ${key}`);
  }

  const breadcrumb = contract.breadcrumb;
  if (!Array.isArray(breadcrumb) || breadcrumb.length !== 3) fail("breadcrumb must have exactly three items");
  const breadcrumbExpected = [
    ["HOME-001", "Home", "/"],
    ["PRODUCT-000", "Products", "/products/"],
    [expected.pageId, expected.gradeCode, expected.path],
  ];
  breadcrumb.forEach((item, index) => {
    assertEqual(item.targetPageId, breadcrumbExpected[index][0], `breadcrumb ${index + 1} target`);
    assertEqual(item.label, breadcrumbExpected[index][1], `breadcrumb ${index + 1} label`);
    assertEqual(item.href, breadcrumbExpected[index][2], `breadcrumb ${index + 1} href`);
  });

  for (const section of ["hero", "positioning", "applications", "evaluation", "technical", "markets"]) {
    if (!contract[section] || typeof contract[section] !== "object") fail(`${section} is required`);
  }
  if (!Array.isArray(contract.technical.columns) || contract.technical.columns.length < 2) fail("technical columns are required");
  if (!Array.isArray(contract.technical.rows) || contract.technical.rows.length === 0) fail("technical rows are required");

  const hero = withoutKeys(contract.hero, ["actions"]);
  const positioning = {
    ...withoutKeys(contract.positioning, ["contextualLink"]),
    contextualLabel: contract.positioning.contextualLink?.label ?? null,
  };
  const applications = {
    ...contract.applications,
    items: contract.applications.items.map((item) => withoutKeys(item, ["targetPageId", "href", "relatedTargets"])),
  };
  const technical = {
    ...withoutKeys(contract.technical, ["action"]),
    columns: contract.technical.columns,
    rows: contract.technical.rows,
  };
  const markets = {
    ...contract.markets,
    items: contract.markets.items.map((item) => ({ label: item.label })),
  };

  return {
    identity: {
      pageId: identity.pageId,
      siteScope: identity.siteScope,
      locale: identity.locale,
      gradeCode: identity.gradeCode,
      slug: identity.slug,
      path: identity.path,
    },
    seo: {
      title: contract.seo.title,
      description: contract.seo.description,
      h1: contract.seo.h1,
      canonical: publicOrigin + expected.path,
      language: contract.seo.language,
      robots: /** @type {"noindex,nofollow"} */ ("noindex,nofollow"),
    },
    breadcrumb: breadcrumb.map(({ label, href }) => ({ label, href })),
    hero,
    positioning,
    applications,
    evaluation: contract.evaluation,
    technical,
    markets,
  };
}

export function validateProductDetailEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) fail("registry entries are required");
  for (const key of ["pageId", "gradeCode", "slug", "path"]) {
    const seen = new Set();
    for (const entry of entries) {
      if (seen.has(entry[key])) fail(`duplicate ${key}: ${entry[key]}`);
      seen.add(entry[key]);
    }
  }
  const canonicals = new Set();
  for (const entry of entries) {
    const canonical = entry.page?.seo?.canonical;
    if (canonicals.has(canonical)) fail(`duplicate canonical: ${canonical}`);
    canonicals.add(canonical);
    assertEqual(entry.page?.identity?.pageId, entry.pageId, "registry page ID");
    assertEqual(entry.page?.identity?.gradeCode, entry.gradeCode, "registry grade code");
    assertEqual(entry.page?.identity?.slug, entry.slug, "registry slug");
    assertEqual(entry.page?.identity?.path, entry.path, "registry path");
  }
  return Object.freeze([...entries]);
}
