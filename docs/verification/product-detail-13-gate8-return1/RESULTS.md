# Remaining 13 Product Detail Pages — Gate 8 Return 1 Results

## Candidate identity

- Repository: `D:\32NextJS`
- Worktree: `D:\32NextJS\.worktrees\product-detail-13-gate8`
- Branch: `codex/product-detail-13-gate8`
- Baseline: `53280559074eab582aecabea6e2593aaf9ccd8ed`
- Prior Gate 8 evidence HEAD: `d75043ba5bf379b804d567db39871019dc778704`
- Implementation commit: `8cee4e8a77de22710dcd95ca9933401f116655c2`
- Build ID: `foS-HPfnTtWVoHkZQg3Jb`
- Runtime: `http://127.0.0.1:8341`
- Runtime hold: `GATE9_PASS_OR_RETURN_NOTICE`

The external `gate8_evidence_manifest.json` binds the final evidence HEAD after this evidence set and return receipt are committed.

## Targeted correction

`PD13-D32-G9-ROOT-F01` reproduced because the shared Cookie Settings dialog relied on native modal focus behavior and did not handle the Tab boundary. On Chrome at 390×844, `Shift+Tab` from the initially focused Close button moved focus to `document.body` while the dialog stayed open.

The shared Cookie Settings host now loops backward from Close to Read Cookie Policy and forward from Read Cookie Policy to Close. The implementation remains in the one shared Consent/Chrome component; no page-private copy was introduced. Close, Escape and backdrop dismissal still restore focus to the invoking Cookie Settings trigger. Consent copy, state and storage behavior are unchanged.

## Verification

| Check | Result |
|---|---|
| Targeted RED reproduction before fix | PASS · failed on all 5 requested routes at the reverse Tab boundary |
| Targeted focus and dismissal suite after fix | PASS · 6/6 |
| TypeScript / Next route types | PASS |
| Next.js production static build | PASS · 19 generated pages |
| Contract and deployment tests | PASS · 11/11 |
| Browser tests | PASS · 121/121 |
| Shared regression routes | PASS · representative CR-901, Home, Product Hub, M-350 and Applications |
| Required product-detail widths | PASS · 1440, 1024, 768, 430, 390 and 320 CSS px |
| Runtime deployment verifier | PASS · 17 routes and 12 deduplicated assets |

The code delta from the prior evidence HEAD is limited to the shared Cookie Settings focus trap and its regression test. The full suite reverified all other acceptance conditions on the replacement build.

## User-excepted non-blockers and external dependencies

Physical-device testing, manual named assistive-technology testing and native browser/operating-system 200% zoom testing are `USER_EXCEPTED / NOT_TESTED / NON_BLOCKING`. The 320 CSS px check remains responsive-layout evidence only.

Contextual RFQ, samples, documents, process, application-child and market receivers remain open integration dependencies. Their unavailable links remain omitted. Gate 10, publication and indexing remain unauthorized.
