# Static three-page verification

Date: 2026-09-20. Initial candidate: `b413696`; final candidate: mobile no-JavaScript correction commit containing this updated record. Scope: standalone `static-site/` only.

## Passed

- Clean dependency installation: `npm ci`; reported zero known vulnerabilities.
- `npm run typecheck`: Next route types and TypeScript passed.
- `npm run build`: static export completed for all three routes.
- Final `npm test`: 37/37 passed (41.2 seconds), Google Chrome on Windows; exported files served on loopback, no WordPress. Typecheck and build passed again after the review fix.
- Six widths per page: 320, 390, 768, 1024, 1280, 1440. No horizontal overflow or failed page assets.
- Selector relationships, FAQ, keyboard menu/dialog, delayed selector hydration, breadcrumb text alignment, local fonts, static copy without JavaScript, canonical/noindex, JSON-LD, exact fifteen technical values, suppression of internal IDs and unavailable detail URLs.
- Twelve screenshots in `screenshots/`: desktop/mobile viewport and full-page captures. Inspected all three pages; narrow evaluation grid and breadcrumb text alignment corrected and retested.
- Review regression: fourteen Home grades and four group descriptions visible on mobile without JavaScript; interactive collapse/expand still works after hydration.

The frozen screenshots represent `b413696`. The final correction changes pre-hydration/no-JavaScript behavior only; final normal-browser captures were checked in ignored test output, without overwriting the original evidence. Review findings and the one unresolved intermittent style assertion are preserved in `REVIEW.md`.

Final exported HTML SHA-256:

| File | SHA-256 |
|---|---|
| out/index.html | 8F46A92DBFAB9548211675A3AA7534A9408FC8444040499EC3BB4A43C8236249 |
| out/products/index.html | DEA84CDC7CDEC70A7F14C37CB6EC308ECAD5C5B24854573A558AC1F1A0C6F485 |
| out/products/m-350/index.html | E3EC3DA49E2D3BC27F68E948169ADB6E5AF435B9289D0BEEA15D061BF11D2C7F |

Environment: Node 24.16.0, npm 11.13.0, Next 16.3.5, React 19.3.0, Playwright 1.63.0. Tests run against a local Python static-file server; Python is not a production dependency.

## Not tested / not performed

Physical devices, manual screen reader, native OS/browser zoom, Web3Forms submission, unavailable destination pages, WordPress test suites, D23 Gate9, develop integration, production deployment. No merge, push or database/media change.

Normal reruns write ignored `static-site/test-results/`, preserving these frozen screenshots. A new evidence candidate must use a new directory.
