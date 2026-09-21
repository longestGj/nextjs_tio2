# Applications child five — Gate 8 verification

Date: 2026-09-21. Baseline: `53280559074eab582aecabea6e2593aaf9ccd8ed`. Branch: `codex/applications-child-5-gate8`. Worktree: `D:/32NextJS/.worktrees/applications-child-5-gate8`.

This candidate adds the five approved static application-detail routes, enables their conditional Hub actions and makes only those five detail pages technically indexable. It does not publish, deploy, change DNS, submit Search Console data or claim that Google has indexed a page.

## Verification result

- `npm ci`: passed on the baseline; 31 packages, zero reported vulnerabilities.
- `npm run typecheck`: passed after the final source-link and approved-eyebrow corrections.
- `npm run build`: passed; Next.js exported the original four pages, all five child pages, `robots.txt` and `sitemap.xml`.
- `npm test`: final fresh run passed 100/100 browser tests and 8/8 Node contract tests against the exported `out/` tree.
- An earlier full run passed 99/100 and recorded three transient `ERR_CONNECTION_REFUSED` asset requests in the existing Home 390px case. Three repeated 390px passes across all nine pages (27/27) and the subsequent fresh full run (100/100) did not reproduce it.
- Applications route/content/metadata/link/Schema/robots/sitemap suite: 14/14 passed.
- Final application visual-evidence run: 16/16 passed.
- Independent code review found one truncated DOI caused by parentheses and one unapproved synthesized eyebrow rule. Both were corrected. Targeted re-review found no remaining actionable issue in those areas.
- The five repository Markdown bodies were mechanically compared with their approved `BUYER_COPY_START`/`BUYER_COPY_END` regions and all five comparisons returned exact equality after the approved Coatings breadcrumb extraction.
- Generated child HTML was scanned for internal Page IDs, Gate/readiness/hash text, private paths, the old domain and runtime WordPress/GraphQL/API references; the scan was clean.

## Gate 9 evidence matrix

| Criterion | Result and evidence |
|---|---|
| APP5-G9-01 | PASS — five directory routes appear in the static build; direct browser and no-JavaScript tests return 200 with substantive initial HTML; network assertions reject runtime CMS/API calls. |
| APP5-G9-02 | PASS — five exact approved Markdown bodies, 10/12/11/11/11 modules and 6/13/4/6/7 sources; unavailable conversion links are removed while request explanations remain. |
| APP5-G9-03 | PASS — literal Grade order and neutral labels are tested; M-350 is the only ready Grade link, Products is ready, and Plastics↔Masterbatch cross-links are ready. Other Grade, Documents, Sample and contextual RFQ destinations are noninteractive and their URLs do not occur in main output. |
| APP5-G9-04 | PASS — full-page and viewport captures at 1440, 768 and 390 for every route; no document overflow, failed assets or hidden headings. |
| APP5-G9-05 | PASS — shared menu/Cookie keyboard behavior, focus return, hero anchors and exact 36-source URL/order/safe-link attributes are automated. Manual screen-reader and physical-device testing remain outside this Gate 8 run. |
| APP5-G9-06 | PASS — exact title, description, canonical, Open Graph, language, breadcrumb and WebPage/BreadcrumbList-only graphs; detail pages are index/follow; robots allows crawling; sitemap contains exactly five canonical URLs. |
| APP5-G9-07 | PASS — existing shared Header/Footer/Menu/Cookie/Logo and fixed RFQ owner are reused; Applications remains current. |
| APP5-G9-08 | PASS — Hub exposes exactly five child actions and matching ItemList entries; Specialty Materials remains without a child action. |
| APP5-G9-09 | PASS — full existing Home, Products, M-350 and Applications tests remain in the 100-test passing suite; their robots metadata remains noindex/nofollow. |
| APP5-G9-10 | PASS — generated-output scan and browser HTML assertions found no internal governance identifiers, private paths, old origin, unready main-link URLs or runtime content endpoints. |
| APP5-G9-11 | PASS for the feature-branch candidate — typecheck, static build and full tests passed on the same final tree. The implementation commit SHA and clean status are recorded in the delivery handoff. Develop integration has not been performed. |
| APP5-G9-12 | PASS for Gate 8 handoff — this record supplies actual changes, evidence, limits, indexing-readiness boundaries and rollback. Search Console submission and per-URL indexing results belong to the later authorized publish/SEO flow. |

## Static output hashes

| Route file | SHA-256 |
|---|---|
| `out/applications/titanium-dioxide-for-coatings/index.html` | `ebd130712f60ccad5b64e136b34eb0c760d51338bbd5440a64f64bd16cd398b4` |
| `out/applications/titanium-dioxide-for-plastics/index.html` | `c4d9859868c5dff61a84498df1ff229d60697fed737035725a47218f2a43f613` |
| `out/applications/titanium-dioxide-for-masterbatch/index.html` | `17180e7951f399c1f1be1e3d6b9705965b85196c195261b3c82f6a5c37bf560a` |
| `out/applications/titanium-dioxide-for-printing-inks/index.html` | `8dff38ee776b301d46cd3be3b22059ba62f54056c0f1158cfa06f3a9b11136aa` |
| `out/applications/titanium-dioxide-for-paper/index.html` | `57155181f3bdc16b7f03fa55d630f7061aa919d7854b436692d71548997ff285` |

The source package, closure, independent review and five copy/contract hashes are in `source-hashes.json`.

## Visual evidence

`screenshots/` contains, for every child page, one viewport and one full-page capture at 1440, 768 and 390 pixels (30 files total). It also contains representative 390px shared Menu and Cookie Settings states. All final captures were inspected; the family hierarchy, responsive tables, long source wrapping and shared chrome remain readable.

## Limits and rollback

- Not performed: D23 independent Gate 9 acceptance, develop integration, main promotion, push, PR, production deployment, custom-domain/DNS work, Search Console submission, analytics activation, form receiver testing, physical-device testing or manual screen-reader testing.
- The original four pages intentionally remain noindex/nofollow. Crawl allowance does not override those page-level directives.
- Technical indexability is not proof of search-engine indexing.
- Rollback is one repository revert of the implementation commit recorded in the handoff. No database, media, WordPress or external state needs restoration.
