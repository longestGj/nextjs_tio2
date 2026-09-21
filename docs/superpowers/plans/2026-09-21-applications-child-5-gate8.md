# Applications Child Pages Gate 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the five approved static Applications child pages, activate their Hub links, and make only those five pages technically indexable through canonical metadata, robots and sitemap output.

**Architecture:** Keep each approved Buyer Clean Copy in repository-versioned page content and render it through one Server Component application-detail family. A typed page registry supplies route metadata and local Markdown; the shared renderer applies the central link-readiness policy while route files remain explicit so the static export produces stable directory pages. Existing shared Header, Footer, Menu and Cookie owners are reused unchanged.

**Tech Stack:** Next.js 16 App Router static export, React 19 Server Components, TypeScript, CSS Modules, Playwright, Node test runner.

**Spec:** `D:/23MySec/pages/applications/06_handoff/APPLICATIONS-CHILD-5_D32-STATIC-NEXTJS_GATE6_HANDOFF_PACKAGE_V1.0.md` (SHA-256 `71153324f999035d3bb42357d3a44170651f49c9de4ae36bad054e16e36baa8c`)

## Global Constraints

- Work only in `D:/32NextJS`; do not modify or depend on the old WordPress repository.
- Build static initial HTML from repository-versioned content; no WordPress, CMS, database, D16 private path, backend or runtime remote content API.
- Preserve the five Buyer Clean Copies, module order, qualifiers, 36 technical sources and exact Grade order.
- Link only destinations that exist in the same candidate. Preserve conversion explanations while omitting unready Documents, Sample and contextual RFQ controls.
- Use `https://tio2products.com` self-canonicals, `index, follow`, an allowing robots policy and a sitemap containing the five canonical URLs.
- Page JSON-LD contains only `WebPage` and `BreadcrumbList`; do not emit Product, ProductGroup, Offer, FAQPage, QAPage, recommendation, equivalence, availability, price or success claims.
- Reuse the current shared Chrome and keep Applications current; do not show buyer-visible internal IDs, Gate/Finding text, hashes, private paths or readiness state.
- Do not push remote `main`, deploy, publish, modify DNS, submit Search Console data or claim Google has indexed the pages.
- This approved five-page batch is one independent repository work item and therefore receives one implementation commit after all verification passes.

## Review Focus

- A child route rendered without JavaScript must still contain its substantive approved copy, tables, Grade labels and sources.
- Unready Grade and conversion destinations must never become anchors, hidden URLs, Schema relations or fake success paths.
- The five child pages must override the root `noindex, nofollow` metadata without changing the four existing pages' robots metadata.
- The sitemap must contain exactly the five approved canonical child URLs and robots must expose the sitemap without blocking pages or assets.
- Long tables, source titles, breadcrumbs and request explanations must wrap at 390px with no horizontal document overflow and preserve record labels.

---

### Task 1: Pin the five-page public contract with failing tests

**Files:**
- Create: `tests/application-detail-pages.spec.ts`
- Modify: `tests/applications.spec.ts`
- Modify: `tests/static-verification.spec.ts`
- Modify: `tests-ci/deployment-smoke.test.mjs`
- Modify: `tests-ci/vercel-output.test.mjs`

**Interfaces:**
- Consumes: approved paths, H1/title/description values, Grade matrices, source counts and Gate 9 IDs 01–10.
- Produces: executable route, content, metadata, link-readiness, Schema, robots, sitemap, static-output and responsive contracts.

- [x] Write route cases for the five paths with literal expected H1, SEO title, description, canonical, Grade order and source count.
- [x] Assert `index, follow`, the visible three-level breadcrumb, `WebPage` plus `BreadcrumbList` only, no conversion anchors, safe HTTPS source anchors, static-copy availability without JavaScript and no remote content requests.
- [x] Change Hub expectations from zero to five ready child actions and an ItemList containing exactly those five WebPage URLs while Specialty Materials stays unlinked.
- [x] Extend responsive/static scans to all nine pages, expecting noindex on the four existing pages and index/follow on the five new pages.
- [x] Add robots and sitemap assertions, including exact five-URL membership and absence of noncanonical/query URLs.
- [x] Extend deployment and Vercel-output fixtures to nine directory routes and mixed robots expectations.
- [x] Run `npm run build`, `npx playwright test tests/application-detail-pages.spec.ts tests/applications.spec.ts`, and `npm run test:contracts`; confirm failures are 404/missing routes, old Hub readiness, absent sitemap/robots and four-route deployment contracts.

### Task 2: Add typed local content and the shared page family

**Files:**
- Create: `content/application-details/coatings.md`
- Create: `content/application-details/plastics.md`
- Create: `content/application-details/masterbatch.md`
- Create: `content/application-details/printing-inks.md`
- Create: `content/application-details/paper.md`
- Create: `lib/content/application-detail-pages.ts`
- Create: `components/sites/tio2-my/applications/malaysia-application-detail.tsx`
- Create: `components/sites/tio2-my/applications/malaysia-application-detail.module.css`
- Modify: `lib/content/page-data.ts`

**Interfaces:**
- Consumes: exact Buyer Clean Copy Markdown and the existing `globalChrome` plus route-readiness owner.
- Produces: `getApplicationDetail(slug)` records and `MalaysiaApplicationDetail` static Server Component output.

- [x] Copy only the approved buyer-visible regions into five repository Markdown files; keep approval metadata, Page IDs and hashes outside public content.
- [x] Define literal slugs, SEO values, hero anchor labels, Grade relations and source counts in a typed registry; use `https://tio2products.com` canonical origin.
- [x] Implement a build-time Markdown renderer for headings, paragraphs, lists, ordered source notes, emphasis, inline code, anchors and tables. Render external sources as safe HTTPS links; render unavailable conversion labels as noninteractive text.
- [x] Render the exact approved Grade tables through the central link-readiness policy so only ready detail routes receive anchors and unavailable actions do not leak URLs.
- [x] Build the common page shell with shared Header/Footer, three-level breadcrumb, approved navy/teal technical hierarchy, responsive labelled tables and visible keyboard focus.
- [x] Add the five application IDs to the central ready-route map only after all five static routes are implemented.
- [x] Run the new page tests and confirm they pass while the Hub/indexing/deployment tests remain red.

### Task 3: Add explicit routes, metadata and approved Schema

**Files:**
- Create: `app/applications/titanium-dioxide-for-coatings/page.tsx`
- Create: `app/applications/titanium-dioxide-for-plastics/page.tsx`
- Create: `app/applications/titanium-dioxide-for-masterbatch/page.tsx`
- Create: `app/applications/titanium-dioxide-for-printing-inks/page.tsx`
- Create: `app/applications/titanium-dioxide-for-paper/page.tsx`
- Modify: `lib/seo.tsx`

**Interfaces:**
- Consumes: the five typed application records and shared detail renderer.
- Produces: five static App Router pages, per-page `Metadata`, Open Graph parity and `applicationDetailSchema(page)`.

- [x] Add five explicit Server Component routes; each exports title, description, self-canonical, Open Graph parity and `robots: { index: true, follow: true }`.
- [x] Add a Schema builder returning only a visible-parity `WebPage` and three-item `BreadcrumbList` graph.
- [x] Confirm `npm run typecheck` and `npm run build` generate all five directory routes and that the targeted route tests pass.

### Task 4: Activate the Hub and indexing surfaces

**Files:**
- Modify: `lib/content/page-data.ts`
- Modify: `content/applications.json` only if approved labels/targets need no semantic change.
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `scripts/verify-deployment.mjs`
- Modify: `tests-ci/deployment-smoke.test.mjs`
- Modify: `tests-ci/vercel-output.test.mjs`

**Interfaces:**
- Consumes: same-candidate readiness for all five child routes and exact canonical URLs.
- Produces: five live Hub actions, Hub ItemList parity, `/robots.txt`, `/sitemap.xml`, nine-route deployment verification and generated Vercel directory routes.

- [x] Confirm Hub uses the existing conditional actions and now exposes exactly five child links; Specialty Materials remains without an action.
- [x] Export robots rules that allow crawling and reference `https://tio2products.com/sitemap.xml`.
- [x] Export a sitemap containing exactly the five child canonical URLs with no query strings or old-domain URLs.
- [x] Extend the deployment verifier with per-route robots expectations so existing noindex pages and new indexable pages are both checked correctly.
- [x] Run targeted Hub, robots, sitemap and contract tests until green.

### Task 5: Complete regression, visual evidence and handoff

**Files:**
- Modify: `README.md`
- Create: `docs/verification/applications-child-5-gate8/**`
- Modify only files identified by failing tests or review findings.

**Interfaces:**
- Consumes: the complete same-commit candidate.
- Produces: Gate 8 evidence for APP5-G9-01 through APP5-G9-12 and one clean implementation commit.

- [x] Update README route/content/indexing limits without claiming publication or Google indexing.
- [x] Run `npm run typecheck`, `npm run build`, `npm test` on the same tree after the shared port is free.
- [x] Capture and inspect full-page screenshots for each child route at 1440, 768 and 390 under a new evidence directory; capture Menu and Cookie states where the shared regression suite does not already cover them.
- [x] Inspect generated `out/` HTML, metadata, JSON-LD, internal/external links, robots and sitemap; scan for internal IDs, hashes, private paths, old canonical origin and runtime remote content calls.
- [x] Review the branch diff, run `git diff --check`, stage only this task and commit once as `feat: add static application detail pages`.
- [x] Return branch/worktree, baseline and implementation SHA, commands, screenshots, Gate 9 matrix, unready-link list, known limits and rollback instructions; do not merge, push or deploy.
