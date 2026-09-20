# Vercel Default-Domain Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 用户已选择 native；实现由当前执行者完成，最后进行一次独立整分支审查。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 origin/main 在远端验证成功后，自动部署到既有 Vercel 项目 `tio2-malaysia` 的默认域名。

**Architecture:** GitHub Actions 是唯一自动发布入口。test job 验证锁定依赖、类型、静态构建和浏览器行为；deploy job 仅在 test 成功后以固定版本 Vercel CLI 构建并发布同一 SHA，随后对返回 URL 执行烟雾检查。

**Tech Stack:** GitHub Actions、Node.js 24、npm、Playwright 1.63.0、Google Chrome、Python 3.12、Vercel CLI 54.18.7、现有 Next.js 16.3.5 静态导出。

**Spec:** `docs/superpowers/specs/2026-09-21-vercel-default-domain-deployment-design.md`，用户已批准。

**状态:** 等待计划审阅；尚未链接项目、创建 Secret、增加 workflow 或部署。

## Global Constraints

- 复用团队 `ailong-s-projects` 的既有空项目 `tio2-malaysia`，项目 ID `prj_vxp7XjRC0UtIhicg8LFAxYX1lqyO`；不创建第二个项目。
- 不启用 Vercel Git 自动部署；GitHub Actions 是唯一自动发布入口。
- 仅 push 到 `main` 触发；deploy 必须依赖 test 成功。
- 只使用 Vercel 默认域名；不添加 `tio2products.com`，不修改 DNS、OCI、WordPress、数据库或媒体。
- 不改变三个页面、canonical、noindex、依赖版本或批准内容。
- 专用 Token 只进入 GitHub Secret `VERCEL_TOKEN`；不读取或迁移本机登录令牌，不在聊天、日志或 Git 中出现。
- `VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` 是 GitHub Variables；`.vercel/` 和本地发布证据被忽略。
- workflow 使用 `permissions: contents: read`、串行 production concurrency、固定 Action SHA 和 Vercel CLI 54.18.7。
- 失败不通过无因重跑掩盖；首次默认域名部署失败不影响 OCI 正式流量。

## Review Focus

1. Secret 缺失、空值或名称错误：workflow 应在部署前明确失败，测试 job 不需要 Secret。
2. deploy job 可绕过 test：结构测试必须确认 `needs: test` 且部署命令只存在于 deploy job。
3. Vercel Git integration 被意外打开造成重复发布：链接后检查项目无 Git 自动连接，workflow 禁止 `vercel git connect`。
4. 默认 URL 可返回 200 但内容/资源错误：线上验证检查三条路由、canonical、noindex、H1 与同源 `_next` 资源。
5. main 新提交并发覆盖或制品与 SHA 不一致：production concurrency 不取消运行；checkout 使用触发 SHA，记录 deployment URL 和 GitHub run SHA。

## File Structure

- Modify `.gitignore`: 忽略 `.vercel/` 和 `.deployment/`。
- Modify `package.json`: 增加 Node contract tests，同时保留 Playwright 完整测试。
- Create `scripts/verify-deployment.mjs`: 对指定 HTTP 基址执行生产烟雾检查。
- Create `tests-ci/deployment-smoke.test.mjs`: 用真实本地 HTTP server 验证烟雾检查器。
- Create `tests-ci/vercel-workflow.test.mjs`: 固定发布门禁、安全权限和命令顺序。
- Create `.github/workflows/deploy-vercel.yml`: 测试通过后发布 production。
- Modify `README.md`, `CONTRIBUTING.md`: 记录默认域名发布入口、所需 GitHub 配置与明确边界。
- Create ignored `.deployment/FINAL-RECEIPT.md`: 首次运行 URL、SHA、测试和未测项；不制造部署后的新候选提交。

## Task 1: 可复用的部署烟雾检查

**Files:** Modify `.gitignore`, `package.json`; create `scripts/verify-deployment.mjs`, `tests-ci/deployment-smoke.test.mjs`.

**Interfaces:** `verifyDeployment(baseUrl: string): Promise<{ routes: number; assets: number }>`；CLI 以 `node scripts/verify-deployment.mjs URL` 调用，失败 exit 1。

- [ ] **Step 1: 写失败测试。** 用 `node:http` 在随机 loopback 端口提供三页 HTML 和一个 `/_next/static/test.js`；断言三路由、canonical、noindex、H1 和静态资源全部验证。另设一例把 Products 返回 404，断言错误包含路径与状态。此时导入不存在的 `scripts/verify-deployment.mjs`。

```js
const result = await verifyDeployment(server.origin);
assert.deepEqual(result, { routes: 3, assets: 1 });
await assert.rejects(() => verifyDeployment(broken.origin), /products.*404/);
```

- [ ] **Step 2: 运行 RED。** `node --test tests-ci/deployment-smoke.test.mjs`，预期因模块不存在失败，而不是测试服务器错误。

- [ ] **Step 3: 实现最小检查器。** 固定 route contract；用内置 `fetch` GET HTML，检查 `content-type`、canonical、robots、H1；收集同源 `/_next/` 的 src/href，逐一 GET 并要求 2xx。对 base URL 用 `new URL()` 校验 http/https；输出只含 URL、数量和错误，不含环境变量。

- [ ] **Step 4: GREEN 并接入测试。** 在 `package.json` 增加 `test:contracts: node --test tests-ci/*.test.mjs`，把 `test` 改为先运行 contract tests 再运行 `playwright test`。`.gitignore` 增加 `.vercel/`、`.deployment/`。运行 `npm run test:contracts` 和完整 `npm test`，预期 contract tests 与原 37 项均通过。

- [ ] **Step 5: 提交。** 明确暂存四个任务文件和 `.gitignore/package.json`，检查 staged diff 后提交 `test: add Vercel deployment smoke contract`。

## Task 2: 测试门禁后的 Vercel workflow

**Files:** Create `tests-ci/vercel-workflow.test.mjs`, `.github/workflows/deploy-vercel.yml`; modify `README.md`, `CONTRIBUTING.md`.

**Interfaces:** workflow 消费 `VERCEL_TOKEN` secret、`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` variables；调用 Task 1 CLI；生产 URL由 deploy step 的 `url` output 传给 smoke step。

- [ ] **Step 1: 写 workflow contract RED。** 测试读取 `.github/workflows/deploy-vercel.yml` 并断言：只触发 main push；`contents: read`；`deploy` 具有 `needs: test`；concurrency `cancel-in-progress: false`；引用三个确切配置名；使用 CLI `54.18.7`；部署后调用检查器；不存在 `vercel git connect`。文件尚不存在时应失败。

- [ ] **Step 2: 运行 RED。** `node --test tests-ci/vercel-workflow.test.mjs`，预期 `ENOENT` 指向 workflow。

- [ ] **Step 3: 创建 workflow。** 使用以下固定 Actions：checkout `11d5960a326750d5838078e36cf38b85af677262`、setup-node `49933ea5288caeca8642d1e84afbd3f7d6820020`、setup-python `a26af69be951a213d495a4c3e4e4022e16d87065`。test job 在 `ubuntu-24.04` 依次执行 `npm ci`、`npx playwright install --with-deps chrome`、typecheck、build、test。deploy job 重新 checkout，同样设置 Node，验证三项配置非空，执行固定 CLI 的 pull/build/deploy；只把部署 URL写入 `$GITHUB_OUTPUT`，再调用 Task 1 检查器。

```yaml
permissions:
  contents: read
concurrency:
  group: vercel-production
  cancel-in-progress: false
jobs:
  deploy:
    needs: test
```

- [ ] **Step 4: GREEN 与文档。** 运行 `npm run test:contracts`，预期 workflow contract 通过。README 增加 GitHub→Vercel 默认域名说明；CONTRIBUTING 明确 main 远端 test→deploy 顺序和自定义域名仍未授权。运行 `git diff --check` 和完整 `npm test`。

- [ ] **Step 5: 提交。** 暂存 workflow、contract test、README、CONTRIBUTING，提交 `ci: deploy tested main commits to Vercel`。

## Task 3: 安全配置既有 Vercel 项目

**Files:** No tracked production code; local ignored `.vercel/project.json`; GitHub Secret/Variables external state.

**Interfaces:** 产出 workflow 所需的三个配置名；不连接 Vercel Git integration。

- [ ] **Step 1: 链接并核对项目。** 在仓库根运行 `vercel link --yes --project tio2-malaysia --scope ailong-s-projects`。检查 `.vercel/project.json` 的 projectId 精确等于批准 ID；查询项目仍为 Next.js、Node24、无重复项目且没有 Git 自动连接。`git check-ignore .vercel/project.json` 必须成功。

- [ ] **Step 2: 设置非秘密变量。** 从链接文件读取 orgId/projectId，执行 `gh variable set VERCEL_ORG_ID` 与 `gh variable set VERCEL_PROJECT_ID`，再用 `gh variable list` 只核对名称和值与链接文件相符。

- [ ] **Step 3: 用户直接录入专用 Token。** 在 Vercel 账号创建仅用于本仓库 Actions 的 Token；用户在 GitHub Secret UI 或交互式 `gh secret set VERCEL_TOKEN --repo longestGj/nextjs_tio2` 中直接粘贴，不发送到聊天。执行者只用 `gh secret list` 确认名称存在，永不读取值。若用户尚未录入，暂停外部发布，保留已完成本地代码，不改用本机 Token。

- [ ] **Step 4: 本地 Vercel build 验证。** 使用本机已认证 CLI 执行 `vercel pull --yes --environment=production` 和 `vercel build --prod`；核对 `.vercel/output` 生成、三页静态输出存在且 Git 工作区无 `.vercel` 变更。此步不调用 deploy。

## Task 4: 审查、集成和首次默认域名部署

**Files:** tracked changes limited to Tasks 1-2 and design/plan; ignored `.deployment/FINAL-RECEIPT.md` after deployment.

**Interfaces:** 消费完整功能分支与已配置 credentials；产出同 SHA develop/main、GitHub run URL、Vercel production URL。

- [ ] **Step 1: native 整分支审查。** 生成治理基线至 HEAD 的 review package，派一位 fresh read-only reviewer，重点检查 Secret 泄漏、test→deploy 门禁、shell injection、固定版本、URL 检查和范围边界。不派第二位审查者；Critical/Important 按 TDD 一次修复，Minor 记录。

- [ ] **Step 2: 合入本地 develop 并验证。** 工作区干净后切 develop，以 no-ff 合并功能分支。运行 `npm ci`、typecheck、build、完整 `npm test`、`vercel build --prod`；记录实际测试数量及候选 SHA。任何失败时 main 保持原位。

- [ ] **Step 3: 快进并推送 main。** 确认 develop 未移动，本地 main `--ff-only` 到已测试 SHA；确认 main/develop 相同且工作区干净，再普通 push origin/main。禁止 force push。

- [ ] **Step 4: 等待远端完成。** 用 `gh run watch --exit-status` 等待该 SHA 的 workflow；失败时读取对应 job logs，停止并调查。成功后取得 workflow URL 和 deploy step URL；用 `vercel inspect` 证明 deployment 属于项目、环境 production 和该 SHA。

- [ ] **Step 5: 独立线上验证与回执。** 再运行 `node scripts/verify-deployment.mjs DEPLOYMENT_URL`，检查三个页面；浏览器检查控制台、资源和关键导航。把 SHA、GitHub run、deployment ID/URL、测试数、no custom domain/OCI untouched 写入 ignored `.deployment/FINAL-RECEIPT.md`。不为写回执制造第二次部署提交。

## Self-review

规范所有边界都有执行步骤；五项 Review Focus 均有 contract test 或外部状态检查。Task 1 先证明检查器能捕获 404；Task 2 先证明 workflow 缺失；Task 3 明确 Token 必须由用户直接安全录入；Task 4 绑定本地候选、GitHub SHA 和 Vercel deployment。没有自定义域名、DNS、OCI 或页面内容变化。
