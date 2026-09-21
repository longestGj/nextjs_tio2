# 13 Product Detail Pages — Gate 8 Implementation Plan

**Goal:** Build and verify the 13 Gate 6 approved product detail pages as static Next.js routes, with exact content provenance, strict grade isolation, preview-only SEO controls, and a complete Gate 8 evidence package.

**Specification:** `D:\23MySec\pages\products\detail-template\06_handoff\PRODUCT-DETAIL-13-GRADE_D32_NEXTJS_GATE6_HANDOFF_PACKAGE_V0.4.md`

**Design:** `docs/plans/2026-09-21-product-detail-13-gate8-design.md`

## Task 1: Add failing contract and registry tests

- [ ] Add a test fixture describing the 13 approved page IDs, grade codes, slugs, paths, contract filenames, and SHA-256 values.
- [ ] Add tests for exact contract hashes, identity fields, approved preview controls, canonical host projection, uniqueness, and public-field isolation.
- [ ] Add tests that reject an invalid identity, duplicate route, mismatched grade, and cross-grade fallback.
- [ ] Run the targeted test and record the expected failure before implementation exists.

## Task 2: Import contracts and implement the registry

- [ ] Copy the exact 13 approved JSON contracts into `content/product-details/` without editing them.
- [ ] Verify every copied file against the Gate 6 SHA-256 value.
- [ ] Add typed contract and public projection definitions.
- [ ] Implement build-time registry validation, canonical host replacement, uniqueness checks, lookup helpers, and public projection stripping.
- [ ] Run the contract and registry tests until they pass.

## Task 3: Add failing route, SEO, schema, and hold tests

- [ ] Add route tests for all 13 static paths and unknown slugs.
- [ ] Add per-page checks for H1, visible approved copy, technical table data, canonical, robots, Open Graph, breadcrumb schema, and Product schema.
- [ ] Add tests for contextual RFQ, sample, and document module omission.
- [ ] Add grade-specific forbidden-term and cross-grade scans.
- [ ] Add checks that raw review and evidence metadata never appear publicly.
- [ ] Run the targeted browser tests and record the expected failure.

## Task 4: Implement shared page rendering and static routes

- [ ] Add the dynamic product detail route with `generateStaticParams`, `dynamicParams = false`, metadata generation, and not-found handling.
- [ ] Add a shared product detail server component that renders the contract projection and supports each technical table shape.
- [ ] Reuse the established product detail CSS and extend it only where the 13 contracts require general rendering behavior.
- [ ] Add generic Product and breadcrumb JSON-LD helpers sourced only from visible content.
- [ ] Keep M-350's explicit route and behavior unchanged.
- [ ] Run route, SEO, schema, hold, and restriction tests until they pass.

## Task 5: Integrate Product Hub readiness

- [ ] Derive the 13 new ready records from the validated registry.
- [ ] Add visible Product Hub links and matching schema URLs while retaining M-350.
- [ ] Add tests that the Hub visible links and schema contain exactly the 14 ready product detail URLs.
- [ ] Verify held process, application, market, RFQ, sample, and document receivers are not invented.

## Task 6: Verify responsive, accessibility, isolation, and regressions

- [ ] Add responsive checks for each page at 1440, 1024, 768, 430, 390, and 320 CSS pixels.
- [ ] Check horizontal overflow, visible H1, usable tables, landmark structure, heading hierarchy, focusable shared actions, and image alternative text where applicable.
- [ ] Run invalid, missing, duplicate, mismatch, cross-grade, and site-scope isolation tests.
- [ ] Run typecheck, production build, the complete test suite, and deployment contract tests against the exact candidate.
- [ ] Review the final diff for unrelated changes and forbidden workflow leakage.

## Task 7: Commit implementation and capture Gate 8 evidence

- [ ] Commit the complete tested implementation as one work-item commit.
- [ ] Build the committed candidate and start a reproducible local static preview on an unused port.
- [ ] Capture per-grade route, head, schema, acceptance, responsive, restriction, isolation, and regression evidence in a new tracked evidence directory.
- [ ] Record dependencies, holds, untested items, and exceptions explicitly.
- [ ] Create and validate the active-schema `gate8_evidence_manifest.json` with executor `04开发`.
- [ ] Commit the evidence, verify final HEAD and clean status, and leave the preview available for Gate 9.
- [ ] Send the §8 return receipt to the source task without initiating Gate 9, Gate 10, merge, deploy, publication, or indexing.
