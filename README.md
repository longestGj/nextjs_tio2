# Three-page static site

Next.js static export for `/`, `/products/`, and `/products/m-350/`. No WordPress, database, API server, secrets or remote content are required to build or serve it. Content belongs to D23; D32 implements and publishes approved changes.

## Run locally

From this directory, use Node.js 24 and npm. Python 3 is used only as a local static-file preview tool; the exported production files need no Python or Node server.

```powershell
npm ci
npm run typecheck
npm run build
npm test
npm run preview
```

Open `http://127.0.0.1:8333/`, `/products/`, and `/products/m-350/`. Stop the preview with Ctrl+C before running tests: the test runner owns the same loopback port and refuses to use an unrelated server. `npm test` requires installed Google Chrome and tests the built `out/` directory, not the development server. Run `npm run build` after changing content or code.

`npm run dev` is available for development but is not the verification target. Static hosts must support directory index files for trailing-slash URLs; use `out/404.html` for missing paths. Deploy the complete `out/` tree, including `_next/`, only after the separate deployment decision and checks.

## Change content / add a page

- `content/home.json`, `products.json`, `m350.json`, `chrome.json`: content and shared navigation; all committed with the code.
- `app/`: fixed page routes and metadata.
- `components/sites/tio2-my/`: shared chrome, Hero, selector, FAQ and page layouts.
- `lib/content/page-data.ts`: server/build-time composition. Products links are enabled only for implemented details. Client selector data excludes internal IDs and unavailable URLs.
- `lib/seo.tsx`: structured data generated from the same visible content. M350 withdrawn/conflicted technical rows are omitted from both table and Schema; Paper is independently conditional.
- `public/`: local assets and the Inter font license.

A new page normally needs approved content, a route and a reusable component, plus tests. Do not introduce a CMS, backend or page registry just to add a page. Approvals and source hashes live in documentation, never as public runtime dependencies.

## Deliberate limits

Only three pages are implemented. Shared navigation and Home retain approved links to future destinations; these are genuine missing-page dependencies. Products exposes only M350 as a working detail link. M350 contextual RFQ, Sample and Document actions stay omitted until those receivers exist; the fixed shared RFQ link remains per the approved chrome contract.

Forms will use Web3Forms directly from the browser. No form or form-receiver backend was added in this batch. Analytics is inactive: Cookie Settings explains that state and does not store a fictitious choice. All pages remain `noindex, nofollow`; no sitemap or indexing activation is included.

This is an independent repository at `D:/32NextJS`, imported from the accepted static application. Its GitHub remote is [longestGj/nextjs_tio2](https://github.com/longestGj/nextjs_tio2). The old WordPress repository and production site remain separate and unchanged. Independent verification is `npm run typecheck`, `npm run build`, `npm test` and screenshot inspection. See [development workflow](CONTRIBUTING.md) and [migration handoff](docs/handoffs/INDEPENDENT-NEXTJS.md).

## Deployment

A push to remote `main` starts `.github/workflows/deploy-vercel.yml`. The workflow tests that exact commit before its deploy job can build and publish it to the existing `tio2-malaysia` Vercel project. Because this is a Next.js static export, the deploy job adds directory-index routes from the generated Vercel output before upload. It then checks the public project URL `https://tio2-malaysia.vercel.app` against the three-page route, metadata, heading and `_next` asset contract. Vercel's unique deployment URL remains available as the immutable deployment receipt but may require team authentication under Standard Protection.

The repository must define GitHub variables `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, plus the dedicated Actions secret `VERCEL_TOKEN`. Vercel Git auto-deployment is deliberately not connected, so GitHub Actions remains the only automatic publishing path. This phase uses only Vercel's default domain; no custom domain, DNS, OCI or WordPress change is part of the deployment.

Test output and screenshots default to ignored `test-results/`. Set `STATIC_EVIDENCE_DIR` to a new candidate-specific directory to collect screenshots for a new verification record. The frozen first candidate is in `docs/verification/static-three-pages/screenshots/`; normal test runs do not overwrite it. Do not reuse accepted evidence directories.

See `docs/handoffs/STATIC-THREE-PAGES.md` for historical source provenance and limitations. That record is preserved as originally delivered; the migration handoff records the user's subsequent Gate9 confirmation and new repository status.
