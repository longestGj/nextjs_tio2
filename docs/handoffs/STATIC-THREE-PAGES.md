# Static three-page candidate

Date: 2026-09-20. Scope: Home `/`, Products `/products/`, M350 `/products/m-350/`.

Status: three-page implementation complete locally; typecheck, static build and all 37 browser tests passed. One read-only final review found a mobile no-JavaScript visibility issue, now corrected and regression-tested. See `../verification/static-three-pages/REVIEW.md` for its disposition and an unresolved intermittent style-test observation. This is not an independent acceptance or release record.

## Ownership and design

D23 owns content, copy and design. D32 implements and verifies. The user approved the static architecture spec and native implementation plan in this task. No CMS, backend, form receiver or extra page was added.

Branch: `codex/grade-domain-design`, isolated at `D:/32Wordpress_new/.worktrees/grade-domain-design`. Initial implementation base: `bed69ff`; approved plan commit: `f494723`. Develop advanced in another task during implementation; this branch was not merged or rebased onto that concurrent work.

Local implementation commits: `4444f68` Home; `8c528c2` Products; `d922d49` M350 and SEO. Final verification changes and review are recorded by subsequent commits on this branch. Do not treat an earlier intermediate commit as the final candidate.

Verification candidate: `b413696`, followed by the mobile no-JavaScript correction commit containing this finalized handoff. Local preview: `http://127.0.0.1:8334/`, `/products/`, `/products/m-350/`. The preview is a temporary static-file server, not deployment.

## Source provenance

Current D23 pointers: HOME-001 Manifest V1.12, PRODUCT-000 D32 Manifest V0.2, GRADE-M350 D32 Manifest V0.7. Their file hashes and precise approved source paths are recorded in `../verification/static-three-pages/source-hashes.json`.

Home content was reconciled with D32 `content/initial-home.json`; shared footer uses its current approved description, not the older D16 string. Products content was reconciled with `docs/verification/products/products-content.json`. M350 content was mapped from the accepted `a96d850` worktree snapshot and checked against D23 Full Buyer Clean Copy V0.1; its current 15-row technical table and qualified Paper relation replace the older D16 copy.

D16 (`D:/16Wordpress_nextjs`) supplied React shared components, Home body, selector and FAQ. Products and M350 page-level presentation was adapted to the currently accepted D32 designs after screenshot comparison exposed differences from D16. No PHP, GraphQL, WordPress content loader, consent analytics machinery or server-cookie RFQ attribution was imported. These local source paths are provenance only; builds read this repository exclusively.

Next.js 16.3.5 and React 19.3.0 were resolved from the npm registry; dependency installation reported zero known vulnerabilities at implementation time. This is an observed audit result, not a guarantee of future safety. Framework security background: [official Next.js security advisories](https://github.com/vercel/next.js/security/advisories).

## Verification scope

Tests exercise the exported HTML and browser behavior using a loopback static server, without WordPress. Coverage includes three routes, six widths (320, 390, 768, 1024, 1280, 1440), image loading, fonts, navigation, selector relationships, FAQ, keyboard menu and Cookie Settings, metadata, Schema, technical values, JS-disabled copy and suppression of internal identifiers/unavailable detail URLs. A delayed-script test reproduces and guards the selector hydration race.

Physical devices, manual screen readers and native OS/browser zoom are not tested. This batch does not claim D23 Gate9 acceptance, develop integration or production validation. Old WordPress test suites were not run because no WordPress application code or data was changed.

## Decisions made during implementation

1. M350 links were enabled only once its route existed; intermediate Products work did not advertise missing detail pages.
2. Current D32 Product/M350 presentation takes precedence over older D16 styling. Shared React components remain reused; page-level adaptation adds no runtime service.
3. Cookie Settings implements the currently inactive analytics state only. Enabling analytics later needs its own implementation and approval; no fake stored consent is created.

## Remaining dependencies / publication boundary

RFQ, Sample, Documents, Processes, Applications, Markets, Resources, About and legal destinations are outside this three-page scope. Home and fixed shared links preserve their approved destinations, which remain real 404 dependencies in this static preview. Product contextual availability rules prevent false ready links. No Web3Forms submission is claimed or tested here.

Production is unchanged. No merge, push, deployment, DNS change, database/media mutation or indexing activation was performed. Existing main deployment still ships WordPress; publishing this application requires a separately verified static-hosting change.
