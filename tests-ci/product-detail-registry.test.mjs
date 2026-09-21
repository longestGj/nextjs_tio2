import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { productDetailCandidates } from "../lib/content/product-detail-candidates.mjs";

const contractsUrl = new URL("../content/product-details/", import.meta.url);

async function core() {
  return import("../lib/content/product-detail-registry-core.mjs");
}

function fixture(candidate = productDetailCandidates[0]) {
  return {
    reviewId: "INTERNAL-REVIEW-ID",
    identity: {
      pageId: candidate.pageId,
      siteScope: "tio2-my",
      locale: "en",
      gradeCode: candidate.gradeCode,
      slug: candidate.slug,
      path: candidate.path,
      templateVersion: "product-detail-v1",
      schemaVersion: "product-detail-v0.1-malaysia",
      recordState: "approved_for_preview",
      contentRevision: "TEST",
    },
    releaseControls: { indexingAuthorized: false, sitemapAuthorized: false },
    seo: {
      title: `${candidate.gradeCode} title`,
      description: `${candidate.gradeCode} description`,
      h1: `${candidate.gradeCode} heading`,
      canonical: `https://tio2malaysia.com${candidate.path}`,
      language: "en",
      robots: "noindex,nofollow",
    },
    breadcrumb: [
      { targetPageId: "HOME-001", label: "Home", href: "/" },
      { targetPageId: "PRODUCT-000", label: "Products", href: "/products/" },
      { targetPageId: candidate.pageId, label: candidate.gradeCode, href: candidate.path },
    ],
    hero: { eyebrow: "TEST", summaryLead: "Lead", summaryBody: "Body", proofs: [], visual: {}, facts: [], actions: [] },
    positioning: { eyebrow: "POSITION", heading: "Position", lead: "Lead", body: "Body", decisionPoints: [] },
    applications: { eyebrow: "APPLICATIONS", heading: "Applications", intro: "Intro", items: [] },
    evaluation: { eyebrow: "EVALUATION", heading: "Evaluation", intro: "Intro", groups: [], disclaimer: "Disclaimer" },
    technical: { eyebrow: "DATA", heading: "Technical", intro: "Intro", sourceLabel: "Source", columns: ["Property", "Value"], rows: [{ property: "TiO₂", value: "99" }], note: "Note" },
    markets: { eyebrow: "MARKETS", heading: "Markets", intro: "Intro", items: [], note: "Note" },
    routeRegistry: [],
    evidenceLedger: { privatePath: "D:/internal" },
  };
}

test("the 13 selected contracts match their Gate 6 hashes and identities", async () => {
  assert.equal(productDetailCandidates.length, 13);
  const seen = new Set();
  for (const expected of productDetailCandidates) {
    const bytes = await readFile(new URL(expected.contractFile, contractsUrl));
    assert.equal(createHash("sha256").update(bytes).digest("hex").toUpperCase(), expected.sha256);
    const contract = JSON.parse(bytes.toString("utf8"));
    assert.deepEqual(
      [contract.identity.pageId, contract.identity.gradeCode, contract.identity.slug, contract.identity.path],
      [expected.pageId, expected.gradeCode, expected.slug, expected.path],
    );
    assert.equal(contract.identity.recordState, "approved_for_preview");
    assert.deepEqual(contract.releaseControls, { indexingAuthorized: false, sitemapAuthorized: false });
    for (const value of [expected.pageId, expected.gradeCode, expected.slug, expected.path]) {
      assert.equal(seen.has(value), false, `duplicate identity value: ${value}`);
      seen.add(value);
    }
  }
});

test("public projection replaces only the canonical host and strips workflow metadata", async () => {
  const { createPublicProductDetail } = await core();
  const expected = productDetailCandidates[0];
  const publicPage = createPublicProductDetail(fixture(expected), expected);
  assert.equal(publicPage.seo.canonical, `https://tio2products.com${expected.path}`);
  assert.equal(publicPage.seo.robots, "noindex,nofollow");
  const serialized = JSON.stringify(publicPage);
  for (const forbidden of ["reviewId", "evidenceLedger", "releaseControls", "contentRevision", "D:/internal"]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
});

test("registry validation rejects invalid, duplicate, mismatched, and cross-grade identities", async () => {
  const { createPublicProductDetail, validateProductDetailEntries } = await core();
  const [first, second] = productDetailCandidates;
  assert.throws(() => createPublicProductDetail({ ...fixture(first), identity: { ...fixture(first).identity, siteScope: "other-site" } }, first), /site scope/i);
  assert.throws(() => createPublicProductDetail(fixture(first), second), /identity mismatch/i);
  assert.throws(
    () => validateProductDetailEntries([
      { ...first, page: createPublicProductDetail(fixture(first), first) },
      { ...second, slug: first.slug, page: createPublicProductDetail(fixture(second), second) },
    ]),
    /duplicate slug/i,
  );
  assert.equal(validateProductDetailEntries([{ ...first, page: createPublicProductDetail(fixture(first), first) }]).length, 1);
});
