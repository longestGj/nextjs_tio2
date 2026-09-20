# Independent Next.js migration

Source: D:/32Wordpress_new, commit d0d778525424325f77456bb0a662577b2d0739ae, static-site/ subtree. Target: D:/32NextJS, independent Git repository, not a worktree of WordPress. Snapshot import retains complete old history in its original repository.

Scope: Home, Products and M350; no runtime behavior, copy, URLs, dependencies or indexing settings changed. README and .gitignore are the only modified imported application files; governance and migration records are new. Source hashes are in ../verification/repository-migration/source-manifest.json. Historical documents and screenshots remain unmodified.

The user confirmed Gate9 passed in this task. No new independent acceptance was conducted and no separate receipt/version binding was fabricated. This migration verifies portability and integration, not Gate9 again.

Governance initialization: 9a20930. Implementation branch: codex/standalone-nextjs-import. Final integration is recorded with its exact SHA in the local .migration receipt and task handoff; main only fast-forwards after testing the actual develop candidate.

Migration verification: 48 unchanged application files and 18 historical documents/evidence files matched source SHA-256; README/.gitignore changes separately recorded. npm ci completed with zero reported vulnerabilities; typecheck and static build passed; all 37 browser tests passed (40.7s) from the new repository. Node 24.16.0, npm 11.13.0, Python 3.12.10. No physical-device/manual-screen-reader validation or production validation is claimed.

Final read-only review of 9a20930..d617084 found no Critical, Important or Minor issues. The reviewer independently verified all source/history hashes, both documented exceptions, the 75 tracked-file allowlist, separate Git directory, absent remote, documentation links and credential exclusions. The reviewer did not rerun tests or Gate9 and did not pre-approve the future integration SHA. Executor test evidence remains separate from review.

Import candidate d617084 passed the full suite again (37/37, 40.8s, zero skipped/unexpected/flaky cases). This document freezes the pre-integration evidence; subsequent actual develop integration result and exact main/develop SHA are in `.migration/FINAL-RECEIPT.md` and the task's final response, avoiding a new post-test documentation commit.

No remote, push, deployment or old WordPress data changes. Future publication requires an authorized remote, static hosting workflow, production checks and rollback path. Existing noindex and missing out-of-scope destinations remain deliberate boundaries.

Execution decisions: use the independent new repository as isolation rather than add another worktree (additional worktrees remain possible later); existing documentation parent-folder copy warnings were handled by per-file presence/hash validation, with all 18 historical files confirmed identical; sole review runs before integration, while the actual merge commit receives its own checks. Old refs/worktree were checked unchanged; production was not contacted. These checks, not a reviewer reconstruction of earlier execution, support the migration record.
