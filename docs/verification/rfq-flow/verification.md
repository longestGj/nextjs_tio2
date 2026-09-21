# RFQ flow candidate verification

## Candidate

- Branch: `codex/rfq-page`
- Candidate SHA: `f976a59f368c064d54710020e972f6e3778145d4`
- Verification date: 2026-09-21 (Asia/Shanghai)
- Scope: `/request-a-quote/`, `/thank-you/`, `/privacy-policy/`, shared chrome, six-route static deployment gates, and the existing Home, Products, and M-350 regression surface.

The worktree was clean before locked verification. The build used only the fixed non-production routing identifier documented by the test workflow. No production routing value is stored in this evidence or in Git.

## Commands and results

| Command | Result |
| --- | --- |
| `npm ci` | Exit 0; 30 packages installed, 0 vulnerabilities. |
| `npm run typecheck` | Exit 0; Next.js route types generated and TypeScript passed. |
| `npm run build` | Exit 0; static export generated all six implemented routes. |
| `npm test` | Exit 0; 9/9 deployment contracts passed; serial Playwright run 95 passed, 1 conditionally skipped, 0 failed, 0 flaky. |
| Tracked credential/config audit | Only the approved dummy UUID is tracked; no `.env`, `.vercel`, `out`, or transient `test-results` paths are tracked. |
| `git diff --check develop...HEAD` | Exit 0. |
| Vercel Production variable-name check | `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` exists; its value was not read or recorded. |

The conditionally skipped Playwright case is the receiver-unavailable variant. This candidate was intentionally built with the fixed non-production identifier, so the configured-build suite skips the mutually exclusive unconfigured state. The unavailable-state contract was exercised in its dedicated implementation task.

The machine-readable, path-sanitized test inventory is in [test-results.json](test-results.json).

## Browser and submission evidence

The responsive matrix exercised all six routes at 320, 390, 768, 1024, 1280, and 1440 CSS pixels. It checked HTTP 200 responses, expected H1 content, image completion, console/page errors, horizontal overflow, shared menu and Cookie Settings keyboard behavior, public HTML identifiers, local fonts, no-JavaScript content, product relationships, and M-350 technical data.

The RFQ tests intercepted `https://api.web3forms.com/submit` before each simulated request. They verified the outgoing field contract and request token, then supplied controlled responses for explicit success, HTTP 400/422/429/500, `success: false`, malformed JSON, HTML, network abort, timeout, retry, and duplicate-dispatch protection. No test request reached Web3Forms and no real RFQ was created.

The following screenshots were visually inspected. Full-page and initial-viewport captures are retained for both widths:

| Route | 390 px | 1440 px |
| --- | --- | --- |
| RFQ | [full page](screenshots/rfq-390.png), [viewport](screenshots/rfq-390-viewport.png) | [full page](screenshots/rfq-1440.png), [viewport](screenshots/rfq-1440-viewport.png) |
| Thank You direct-entry fallback | [full page](screenshots/thank-you-390.png), [viewport](screenshots/thank-you-390-viewport.png) | [full page](screenshots/thank-you-1440.png), [viewport](screenshots/thank-you-1440-viewport.png) |
| Privacy Policy | [full page](screenshots/privacy-390.png), [viewport](screenshots/privacy-390-viewport.png) | [full page](screenshots/privacy-1440.png), [viewport](screenshots/privacy-1440-viewport.png) |

Visual review found no horizontal overflow, clipped controls, overlapping content, broken assets, unexpected placeholders, or shared-chrome regressions at the retained widths.

## Security and configuration audit

- The production Web3Forms routing identifier is not committed, printed, copied into screenshots, or written into this evidence.
- Vercel Production now contains the required variable under the linked `tio2-malaysia` project. The environment listing was checked by name only.
- The workflow test job uses the fixed non-production UUID. The deploy job obtains Production configuration through `vercel pull` and the public smoke check rejects a deployment without RFQ form markup.
- The browser accepts success only for HTTP 200, JSON media type, valid JSON, and `success: true`. Every ambiguous or negative response keeps the form unconfirmed and creates no Thank You receipt.
- The Thank You success state requires one matching, fresh session receipt; URL parameters alone cannot create a success state, and a successful read consumes the receipt so it cannot be replayed by refreshing the page.

## Remaining release work and deliberate limits

- Whole-branch review and local `develop` integration are performed after this evidence commit; this document does not claim those later gates have passed.
- No real Web3Forms delivery was sent. Production delivery is deliberately deferred to an explicitly authorized live test after deployment.
- `/request-sample/`, `/request-documents/`, `/privacy-policy-bm/`, and `/cookie-policy/` remain declared dependencies, not completed routes.
- The candidate remains `noindex, nofollow`. Custom domain, DNS, OCI, WordPress, analytics, and indexing changes are outside this release.
- Final publication still requires local `develop` integration verification, local `main` merge, remote `main` push, successful GitHub Actions/Vercel deployment, and six-route public smoke verification.
