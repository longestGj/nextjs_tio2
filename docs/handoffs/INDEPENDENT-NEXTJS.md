# Independent Next.js migration

Source: D:/32Wordpress_new, commit d0d778525424325f77456bb0a662577b2d0739ae, static-site/ subtree. Target: D:/32NextJS, independent Git repository, not a worktree of WordPress. Snapshot import retains complete old history in its original repository.

Scope: Home, Products and M350; no runtime behavior, copy, URLs, dependencies or indexing settings changed. README and .gitignore are the only modified imported application files; governance and migration records are new. Source hashes are in ../verification/repository-migration/source-manifest.json. Historical documents and screenshots remain unmodified.

The user confirmed Gate9 passed in this task. No new independent acceptance was conducted and no separate receipt/version binding was fabricated. This migration verifies portability and integration, not Gate9 again.

Governance initialization: 9a20930. Implementation branch: codex/standalone-nextjs-import. Final integration is recorded with its exact SHA in the local .migration receipt and task handoff; main only fast-forwards after testing the actual develop candidate.

Migration verification: 48 unchanged application files and 18 historical documents/evidence files matched source SHA-256; README/.gitignore changes separately recorded. npm ci completed with zero reported vulnerabilities; typecheck and static build passed; all 37 browser tests passed (40.7s) from the new repository. Node 24.16.0, npm 11.13.0, Python 3.12.10. No physical-device/manual-screen-reader validation or production validation is claimed.

Current stage: import validated, final review and develop integration pending. No remote, push, deployment or old WordPress data changes. Future publication requires an authorized remote, static hosting workflow, production checks and rollback path. Existing noindex and missing out-of-scope destinations remain deliberate boundaries.
