# Applications child five — Gate 8 verification

Date: 2026-09-21. Original baseline: `53280559074eab582aecabea6e2593aaf9ccd8ed`. Integration parents: Applications `b8b00e423d04c4143c967ffce86a5ba00e81338e` plus local `develop` `28a2f5d28334a253d3d2fd0a73bf789c3b180ddb`. Branch: `codex/applications-child-5-gate8`. Worktree: `D:/32NextJS/.worktrees/applications-child-5-gate8`.

This integrated candidate contains the five approved static application-detail routes plus the RFQ, Thank You and Privacy work merged from `develop`. It enables the five conditional Hub actions and the now-ready RFQ actions, while making only the five detail pages technically indexable. It does not publish, deploy, change DNS, submit Search Console data or claim that Google has indexed a page. The parallel product-detail branch remains independent and is not included.

## Gate 9 targeted repair return

The returned candidate `0c117ee0941a3b307f761ff0db5ea67fc98b5a07` was repaired in implementation commit `ede0e32c2c73477589447344921c34370307206a`. The shared Cookie Settings dialog now loops keyboard focus from the first control to the last with `Shift+Tab` and from the last control to the first with `Tab`; Escape, button/backdrop close and trigger focus restoration remain intact. The regression assertion was observed failing before the implementation and passing after a fresh static rebuild. All 12 implemented routes exercise the shared behavior.

The exact repaired `out/` contains 93 files. `gate9-repair-build-binding.json` lists every relative path and SHA-256 and binds them to the implementation commit. `gate9-repair-test-results.json` records the fresh typecheck, build, full test and narrowed focus results. The repository-external V1.1 Manifest identifies the later evidence commit without creating a commit self-reference.

## Verification result

- `npm ci`: passed on the baseline; 31 packages, zero reported vulnerabilities.
- `git diff --check` and `git diff --cached --check`: passed after conflict resolution.
- `npm run typecheck`: passed on the integrated tree.
- `npm run build`: passed; Next.js exported all 12 implemented pages, `robots.txt` and `sitemap.xml`.
- `npm test`: final fresh integrated run passed 158 browser tests, skipped the intentional unconfigured-receiver variant, and passed 9/9 Node contract tests against the exported `out/` tree.
- An earlier full run passed 99/100 and recorded three transient `ERR_CONNECTION_REFUSED` asset requests in the existing Home 390px case. Three repeated 390px passes across all nine pages (27/27) and the subsequent fresh full run (100/100) did not reproduce it.
- Applications route/content/metadata/link/Schema/robots/sitemap suite: 14/14 passed.
- Final integrated application visual-evidence run: 31/31 passed.
- Independent code review found one truncated DOI caused by parentheses and one unapproved synthesized eyebrow rule. Both were corrected. Targeted re-review found no remaining actionable issue in those areas.
- The five repository Markdown bodies were mechanically compared with their approved `BUYER_COPY_START`/`BUYER_COPY_END` regions and all five comparisons returned exact equality after the approved Coatings breadcrumb extraction.
- Generated child HTML was scanned for internal Page IDs, Gate/readiness/hash text, private paths, the old domain and runtime WordPress/GraphQL/API references; the scan was clean.

## Gate 9 evidence matrix

| Criterion | Result and evidence |
|---|---|
| APP5-G9-01 | PASS — five directory routes appear in the static build; direct browser and no-JavaScript tests return 200 with substantive initial HTML; network assertions reject runtime CMS/API calls. |
| APP5-G9-02 | PASS — five exact approved Markdown bodies, 10/12/11/11/11 modules and 6/13/4/6/7 sources; unavailable Document/Sample links are removed while request explanations remain, and the integrated RFQ destination is active. |
| APP5-G9-03 | PASS — literal Grade order and neutral labels are tested; M-350 is the only ready Grade link, Products and RFQ are ready, and Plastics↔Masterbatch cross-links are ready. Other Grade, Documents and Sample destinations remain noninteractive and their URLs do not occur in main output. |
| APP5-G9-04 | PASS — full-page and viewport captures at 1440, 768 and 390 for every route; no document overflow, failed assets or hidden headings. |
| APP5-G9-05 | PASS — shared menu/Cookie keyboard behavior, focus return, hero anchors and exact 36-source URL/order/safe-link attributes are automated. Manual screen-reader and physical-device testing remain outside this Gate 8 run. |
| APP5-G9-06 | PASS — exact title, description, canonical, Open Graph, language, breadcrumb and WebPage/BreadcrumbList-only graphs; detail pages are index/follow; robots allows crawling; sitemap contains exactly five canonical URLs. |
| APP5-G9-07 | PASS — existing shared Header/Footer/Menu/Cookie/Logo and fixed RFQ owner are reused; Applications remains current. |
| APP5-G9-08 | PASS — Hub exposes exactly five child actions and matching ItemList entries; Specialty Materials remains without a child action. |
| APP5-G9-09 | PASS — full Home, Products, M-350, Applications, RFQ, Thank You and Privacy coverage remains in the integrated 158-test passing suite; all except the five detail pages remain noindex/nofollow. |
| APP5-G9-10 | PASS — generated-output scan and browser HTML assertions found no internal governance identifiers, private paths, old origin, unready main-link URLs or runtime content endpoints. |
| APP5-G9-11 | PASS for the integrated feature-branch candidate — the Applications implementation and local `develop` RFQ parent were merged without product-detail work; typecheck, static build, full tests and evidence regeneration passed on the resulting tree. The merge SHA, parents and clean status are recorded in the delivery handoff. |
| APP5-G9-12 | PASS for Gate 8 handoff — this record supplies actual changes, evidence, limits, indexing-readiness boundaries and rollback. Search Console submission and per-URL indexing results belong to the later authorized publish/SEO flow. |

## Static output hashes

| Route file | SHA-256 |
|---|---|
| `out/applications/titanium-dioxide-for-coatings/index.html` | `5457b28ed845e50313b9c83deb5db960c0129718107329f9be1c6c52759fc472` |
| `out/applications/titanium-dioxide-for-plastics/index.html` | `d9bb253d24a86e514aae7603fa0b912bad7b21d12eac87784e3e5fded6e4e6e9` |
| `out/applications/titanium-dioxide-for-masterbatch/index.html` | `b51caa17c5ef9483b14a0b44be9f053897c2e2a2ac6267fa18ce952ba45af61c` |
| `out/applications/titanium-dioxide-for-printing-inks/index.html` | `06eecb440b29c2fd3ee547143f5db887c16f584fd429c9f082844c54ee117402` |
| `out/applications/titanium-dioxide-for-paper/index.html` | `7e35544a28f7fc56151f10c887a93f05d7b8bfe3db4756afe46b69dd6ae6f75e` |

The source package, closure, independent review and five copy/contract hashes are in `source-hashes.json`.

## Visual evidence

`screenshots/` contains, for every child page, one viewport and one full-page capture at 1440, 768 and 390 pixels (30 files total). It also contains representative 390px shared Menu and Cookie Settings states. All final captures were inspected; the family hierarchy, responsive tables, long source wrapping and shared chrome remain readable.

## Limits and rollback

- Not performed: D23 independent Gate 9 acceptance, merge back to `develop`, main promotion, push, PR, production deployment, custom-domain/DNS work, Search Console submission, production Web3Forms submission, physical-device testing or manual screen-reader testing.
- The original four pages intentionally remain noindex/nofollow. Crawl allowance does not override those page-level directives.
- Technical indexability is not proof of search-engine indexing.
- Rollback is one repository revert of the implementation commit recorded in the handoff. No database, media, WordPress or external state needs restoration.
