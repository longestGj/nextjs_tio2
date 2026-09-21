# 13 Product Detail Pages — Gate 8 Design

## Scope

Implement the 13 approved product detail pages from the Gate 6 handoff package on the Next.js static site. The work is preview only. It does not include Gate 9, Gate 10, merge, deployment, publication, or indexing.

The approved candidates are M-510, M-896, M-895, M-340, M-886, M-52, M-108, M-210, M-200, M-996, M-2196, M-2377, and CR-901. The existing M-350 page remains unchanged and is a regression surface.

## Source of truth

The implementation consumes the exact approved JSON contracts named in `PRODUCT-DETAIL-13-GRADE_D32_NEXTJS_GATE6_HANDOFF_PACKAGE_V0.4.md`. Their files are copied into the repository without editing and their SHA-256 hashes are tested against the Gate 6 values.

The raw contracts remain evidence inputs only. A public projection exposes only approved visitor-facing fields. Review IDs, approval records, evidence ledgers, internal source paths, and workflow metadata never enter rendered HTML or public JSON-LD.

## Build-time registry

A typed product detail registry imports all 13 contracts at build time. Each entry binds one page ID, grade code, slug, route path, and source contract. Registry initialization validates:

- the expected page ID, grade code, slug, and route path;
- Malaysia site scope and `en-MY` locale;
- approved preview state and release controls;
- canonical path after the approved host replacement;
- breadcrumb identity;
- uniqueness of page IDs, grade codes, slugs, paths, and canonicals;
- the presence of hero, positioning, applications, evaluation, and technical data.

Any mismatch throws during build or tests, so a grade cannot silently render another grade's content.

## Routing and rendering

The 13 pages use `app/products/[slug]/page.tsx` with `generateStaticParams` and `dynamicParams = false`. The existing explicit `/products/m-350/` route remains authoritative for M-350. Unknown slugs return the static not-found page.

A shared server component renders the approved public projection. The component uses the existing product detail visual system so the new pages remain consistent with M-350 while supporting each contract's own technical table headings and rows.

## Dependency holds

The fixed global RFQ control remains because it is existing shared chrome. Contextual hero quote actions are omitted while `CONV-RFQ` is on hold. Sample and document modules are omitted atomically while their receivers are unavailable. Approved process, application, and market copy may remain visible, but unavailable links are rendered as plain text rather than dead or substitute links.

No empty wrappers, fake receivers, cross-grade fallbacks, or lost grade context are allowed.

## SEO, schema, and indexing

Each page receives its contract title, description, canonical path on `https://tio2products.com`, and matching Open Graph fields. The global noindex/nofollow policy remains active and the pages remain absent from the sitemap.

Each page emits one Product JSON-LD object and a breadcrumb schema. Product identity, URL, description, and `additionalProperty` values come only from the visible page projection. Offers, ratings, global identifiers, certifications, regulatory claims, comparisons, and hidden relationships are omitted.

## Product hub

The Product Hub derives the 13 new ready routes from the same validated registry used by routing. Its visible links and schema URLs therefore cannot drift from the generated pages. M-350 remains included through its existing ready record.

## Verification and evidence

Tests cover exact contract hashes, identity validation, public projection isolation, metadata and schema, dependency omissions, grade-specific restriction scans, all 13 routes, unknown route behavior, Product Hub readiness, responsive layouts at the required widths, accessibility basics, and regression of the current site surfaces.

The final Gate 8 evidence set records the exact implementation commit, evidence HEAD, clean status, build identity, reproducible preview URL, per-page acceptance results, isolation and negative cases, regressions, dependencies, exceptions, and the active `gate8_evidence_manifest.json`. The preview process remains available for Gate 9, but no Gate 9 review is performed here.
