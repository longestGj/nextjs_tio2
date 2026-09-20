# Independent Next.js Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 用户已选择 native，保留该方式；仅最终使用一位独立只读审查者。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `D:/32NextJS` 建立可独立构建、可追溯、集成验证通过的本地 Next.js 仓库。

**Architecture:** 将旧仓库固定提交的 `static-site/` 快照提升到新仓库根目录。旧仓库保留完整历史，新仓库只包含静态应用、必要文档与证据；本地 develop 集成后，main 快进至相同已测试提交。

**Tech Stack:** Git、PowerShell、现有 Node 24/npm、Next.js 16.3.5、React 19.3.0、Playwright 1.63.0、Google Chrome、Python 静态预览。

**Spec:** `docs/superpowers/specs/2026-09-20-independent-nextjs-repository-design.md`，用户已批准。

**状态:** 计划等待审阅；尚未创建新仓库。执行地点是新仓库，绝不能在旧仓库执行下文的分支初始化或合并命令。

## Global Constraints

- 来源固定为 `D:/32Wordpress_new/.worktrees/grade-domain-design` 的提交 `d0d7785`。
- 不升级依赖，不重写页面，不改变 URL、canonical 或 noindex 状态。
- Gate9 沿用用户确认，不重新验收、不编造回执。
- 新目录 `D:/32NextJS` 若已存在，先核实归属，不覆盖。
- 不迁入 WordPress/PHP、数据库、Docker 配置、旧 GitHub Actions、旧 .git、环境凭据、node_modules、.next、out 或临时测试输出。
- 本轮不创建 GitHub 仓库、不设置 origin、不推送、不配置未知托管平台。
- 旧数据库、媒体、分支与 worktree 不变；旧设计分支仅记录设计及计划。
- 新测试证据使用 `docs/verification/repository-migration/`，不覆盖历史三页证据。
- 本地 develop/main 最终指向同一已验证 SHA，集成失败不能更新 main。

## Review Focus

1. 目标目录已存在或处在其他 Git 仓库内：初始化前拒绝，避免覆盖或嵌套。
2. 误复制未提交文件、依赖、凭据或旧工作流：仅导出固定提交白名单，逐文件 SHA-256 比较。
3. 提升 static-site 层级后遗留相对路径：修正 README 文档链接，实际在新根目录构建和执行浏览器测试。
4. 合并或补充证据导致测试 SHA 与 main 不一致：记录测试候选，提交任何新代码后重新验证受影响检查；最终 SHA 严格相同。
5. 旧验收证据被覆盖、端口占用或偶发失败被掩盖：保持历史字节一致，测试前查 8333，失败调查并保留记录。

## File Structure

- 根目录 `app/ components/ content/ lib/ public/ tests/` 与构建配置、lockfile：来自源快照。
- `README.md`：在源静态站 README 上修正文档路径和独立仓库说明。
- `AGENTS.md`、`CONTRIBUTING.md`、`.gitignore`：独立静态站治理与安全边界。
- `docs/handoffs/STATIC-THREE-PAGES.md`、`docs/verification/static-three-pages/`、原三页方案/计划：原样归档。
- 本迁移方案/计划：复制已批准版本，不作为运行依赖。
- `docs/verification/repository-migration/source-manifest.json`：来源 full SHA、相对文件路径与 SHA-256、允许的文档调整。
- `docs/handoffs/INDEPENDENT-NEXTJS.md`：实际迁移、验证、Git 状态及发布边界。

## Task 1: 可追溯的独立静态站仓库

**Files:** 新仓库上述所有文件；旧仓库应用文件不变。

**Interfaces:** 消费固定源提交与批准方案；产出独立 .git、治理起点 main/develop、已提交的 `codex/standalone-nextjs-import` 候选及可复用的原 37 项测试。

- [ ] **Step 1: 只读预检并固定输入。** 检查旧 worktree 状态及提交存在；解析 full SHA，确认新路径不存在且 D:/ 不是仓库；检测工具与端口。每条 Git/安装/测试命令检查退出码，失败立即停止依赖步骤。

```powershell
$sourceRepo = 'D:/32Wordpress_new/.worktrees/grade-domain-design'
$targetRepo = 'D:/32NextJS'
git -C $sourceRepo status --short
git -C $sourceRepo rev-parse 'd0d7785^{commit}'
if (Test-Path -LiteralPath $targetRepo) { throw 'Target exists: inspect ownership before continuing' }
git -C D:/ rev-parse --show-toplevel
# 上条应因 D:/ 不在 Git 仓库中而失败；若成功则停止，重新选择独立路径。
Get-NetTCPConnection -LocalPort 8333 -State Listen -ErrorAction SilentlyContinue
node --version
npm --version
python --version
```

- [ ] **Step 2: 初始化治理起点。** 用 apply_patch 创建新目录中的 AGENTS.md、CONTRIBUTING.md 和 .gitignore。AGENTS 明确 D23/D32 分工、静态导出、无后台、明确文件暂存、不改历史证据、不操作旧仓库。CONTRIBUTING 明确功能分支→本地 develop→集成→main 同 SHA→未来只推 main，保留当前无远端/发布的事实。

`.gitignore` 初始精确内容：

```gitignore
node_modules/
.next/
out/
test-results/
playwright-report/
*.tsbuildinfo
.env
.env.*
!.env.example
*.pem
*.key
.worktrees/
.superpowers/
.migration/
```

```powershell
git -C D:/32NextJS init -b develop
git -C D:/32NextJS config core.autocrlf false
git -C D:/32NextJS add -- AGENTS.md CONTRIBUTING.md .gitignore
git -C D:/32NextJS diff --cached --check
git -C D:/32NextJS commit -m 'chore: initialize standalone static-site governance'
git -C D:/32NextJS branch main
git -C D:/32NextJS switch -c codex/standalone-nextjs-import
```

新仓库本身已与旧任务隔离，无并行实现，不再额外复制 worktree；按 using-git-worktrees 技能核对这项隔离决定。

- [ ] **Step 3: 导出固定提交，不复制工作目录。** 用临时目录保存归档并解压。全部源文件来自提交，排除未跟踪凭据与构建产物；不从旧 worktree 直接递归复制。

```powershell
$migrationTemp = Join-Path ([IO.Path]::GetTempPath()) ('tio2-migrate-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $migrationTemp
git -C $sourceRepo archive --format=zip -o "$migrationTemp/source.zip" d0d7785 static-site docs/handoffs/STATIC-THREE-PAGES.md docs/verification/static-three-pages docs/superpowers/specs/2026-09-20-static-three-pages-design.md docs/superpowers/plans/2026-09-20-static-three-pages.md
Expand-Archive -LiteralPath "$migrationTemp/source.zip" -DestinationPath "$migrationTemp/source"
```

- [ ] **Step 4: 迁移前先建立失败校验。** 从解压出的 static-site 用下方只读命令生成预期清单，经 apply_patch 保存 JSON；在应用文件尚未迁入时执行校验，应明确失败于缺失文件。这里只验证搬迁，不新增产品行为或修改原测试。

```powershell
$appSource = Join-Path $migrationTemp 'source/static-site'
Get-ChildItem -LiteralPath $appSource -Recurse -File | ForEach-Object {
  [pscustomobject]@{ path = [IO.Path]::GetRelativePath($appSource, $_.FullName).Replace('\','/'); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
} | ConvertTo-Json
# 将输出与 full source SHA 写入 source-manifest.json 的 files/sourceCommit 字段。
$manifest = Get-Content "$targetRepo/docs/verification/repository-migration/source-manifest.json" -Raw | ConvertFrom-Json
foreach ($entry in $manifest.files) {
  if ($entry.path -in @('README.md', '.gitignore')) { continue }
  $candidate = Join-Path $targetRepo $entry.path
  if (!(Test-Path -LiteralPath $candidate)) { throw "Missing: $($entry.path)" }
  if ((Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Mismatch: $($entry.path)" }
}
```

- [ ] **Step 5: 原样迁入，再最小化调整文档。** 从归档复制 app/components/content/lib/public/tests 及根配置、package 与 lockfile；排除源 .gitignore，保留治理版；README 先原样复制，再用 apply_patch 将 `../docs/` 改为 `docs/`，明确当前独立仓库未配置远端和发布。其余文本不得顺手格式化，二进制素材原样复制。

```powershell
Get-ChildItem -LiteralPath $appSource -Force | Where-Object Name -ne '.gitignore' | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $targetRepo -Recurse
}
Copy-Item -LiteralPath "$migrationTemp/source/docs" -Destination $targetRepo -Recurse
```

把本次已批准方案和计划复制到新 docs 对应目录；用 apply_patch 写 INDEPENDENT-NEXTJS.md，注明源提交、快照导入、用户告知 Gate9 已通过、未提供新回执、旧站未变、当前阶段。原三页历史文档不改写。清单记录 README/.gitignore 的源值、新值与差异原因；对历史证据另生成并比对逐文件哈希。

- [ ] **Step 6: 校验与本地测试。** 重跑 Step 4，预期所有非例外文件字节一致。核对 README 的 docs 链接存在；`git remote -v` 为空，`.git` 是本目录而非旧仓库引用；根目录不包含 wp-content、Docker 或 .github。运行以下命令，任何失败先调查，不通过重跑掩盖。

```powershell
Set-Location D:/32NextJS
git rev-parse --show-toplevel
git rev-parse --git-common-dir
git remote -v
git check-ignore -- .env .env.local out/index.html node_modules/example .next/example
npm ci
npm run typecheck
npm run build
npm test
```

预期 37 项浏览器测试通过，导出三个路由，无 WordPress 运行依赖。输出保留在新仓库 ignored test-results；不覆盖旧证据。检查 `git status --short`，只有预期源码/文档；指定清单文件暂存，diff 与 cached diff/check 审阅后提交 `feat: import accepted three-page static site`。

## Task 2: 审查、本地集成与 main 初始化完成

**Files:** 只新增或补充 `docs/handoffs/INDEPENDENT-NEXTJS.md`、`docs/verification/repository-migration/`；应用仅在确有迁移缺陷时最小修复并测试。

**Interfaces:** 消费 Task 1 已验证候选；产出同 SHA 的本地 develop/main、最终验证记录和交付说明。

- [ ] **Step 1: native 最终只读审查。** 按 executing-plans/requesting-code-review 派一位新审查者，范围为治理起点至功能分支 HEAD。重点是来源哈希、路径、凭据排除、独立 .git、旧历史证据和无远端边界。不重复 Gate9。不再派第二位审查者。修复重要发现并运行相关测试；无发现则不改代码。

- [ ] **Step 2: 保存迁移记录并冻结功能候选。** 记录实际安装、类型、构建与浏览器结果及审查处置，不宣称还未发生的合并。若新增文档提交，检查路径/差异后提交 `docs: record standalone migration verification`。记录这时的功能分支 SHA。

- [ ] **Step 3: 合入新仓库 develop。** 确认干净工作区，确认当前仓库根目录是 D:/32NextJS；不使用 fetch/pull，不接触旧仓库分支。

```powershell
git status --short
git switch develop
git merge --no-ff codex/standalone-nextjs-import -m 'merge: integrate standalone static site'
$testedCandidate = git rev-parse HEAD
npm run typecheck
npm run build
npm test
```

通过后核对源码哈希和三个 out HTML 均存在。测试失败时 main 保持初始化提交；从当前 develop 新建 `codex/fix-standalone-integration` 修复，经测试审查合回，再验证实际候选。

- [ ] **Step 4: 仅快进 main 到精确测试 SHA。** 命令之间检查退出码。若 develop 已被其他操作移动，不使用旧测试结论推进。

```powershell
if ((git rev-parse develop) -ne $testedCandidate) { throw 'Candidate moved after tests' }
git switch main
git merge --ff-only $testedCandidate
if ((git rev-parse main) -ne (git rev-parse develop)) { throw 'main/develop mismatch' }
git remote -v
git status --short
git log -4 --oneline
```

精确 SHA、集成测试输出和本地完成回执保存到 ignored `.migration/`，通过 apply_patch 写入；不为了记录同一提交号额外制造未经集成测试的提交。正式追溯文档已在候选内，最终回执和聊天绑定合并 SHA。

- [ ] **Step 5: 交付并保留。** 交付新仓库目录、develop/main SHA、37 项测试真实结果、旧仓库未变的核对及无远端事实。保留功能分支、新仓库和临时归档供核查，不删除旧 worktree。发布仍需单独确定远端仓库、托管平台、自动测试部署及回滚；本轮不执行。

## Self-review

五项风险均有对应检查；迁移内容、历史证据、Git 初始状态、精确 SHA 集成、用户 Gate9 结论和无远端边界覆盖批准方案。应用迁移不新增功能，因此红/绿验证针对文件缺失与字节一致性，原 37 项浏览器测试保持不变。文档与测试产物位置分离，避免最终证据提交改变已经验证的发布候选。
