# 开发与发布流程

本仓库是独立 Next.js 静态站，D23 负责策划、文案与批准输入，本项目负责开发和发布。普通页面变更复用现有组件，不建立 CMS 或自己的表单接收服务。

## Git

本地功能分支 → 本地 develop → 集成测试 → 本地 main 快进到相同 SHA → 经授权推送远端 main → 自动测试和发布。

新功能/修复/文档从最新本地 develop 创建 codex/ 分支；完成后合回本地 develop。功能分支和 develop 不常规推送。main 是发布指针，不能直接开发，也不从功能分支直接合入。

普通集成验证执行 `npm ci`、`npm run typecheck`、`npm run build`、`npm test`；任何代码组合变化都需验证实际候选。涉及 Vercel 工作流、构建配置或发布脚本时，在具备对应项目配置且已获授权的环境中另使用工作流锁定的 Vercel CLI 版本执行 `pull --yes --environment=production`、`build --prod` 和 `node scripts/prepare-vercel-output.mjs`，核对生成路由与制品，并确认 `.vercel` 未被纳入版本控制；无法执行的项目明确标为未测试。失败时保持 main 不变，从 develop 建修复分支。每个独立且通过验证的工作项一个 commit，检查 git diff、git diff --cached 和 git diff --cached --check。

初始化例外：首次 develop 仅提交治理文件，main 从此建立起点；应用仍通过功能分支导入与集成。`origin` 是 `https://github.com/longestGj/nextjs_tio2.git`，仅 `main` 是常规推送目标。

远端 `main` 的 push 触发 GitHub Actions：先对该 SHA 执行锁定依赖安装、类型检查、静态构建和完整测试；只有 test job 成功，deploy job 才能用固定版本 Vercel CLI 发布同一 SHA。静态导出的目录索引路由在上传前从实际 Vercel output 自动生成；发布后对公开项目默认域名 `https://tio2-malaysia.vercel.app` 执行生产烟雾检查。远端工作流成功且公开域名烟雾检查通过，才可把该 SHA 记为发布完成；push 本身不是发布完成。单次 deployment URL 在 Vercel Standard Protection 下可能要求团队登录，只作为不可变发布回执。GitHub Actions 是唯一自动发布入口，不连接 Vercel Git integration。所需配置为 variables `VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` 和专用 secret `VERCEL_TOKEN`，秘密不得出现在提交、日志或聊天中。

若远端 `main` 已更新但流水线失败，保留失败提交和运行记录，不强推、不回退或重写共享历史。以本地 `develop` 为起点建立 `codex/` 修复分支，修复后合回 `develop` 并重新完成集成验证；再将本地 `main` 快进到新的通过候选并正常推送，由新 SHA 触发完整流水线。远端 `main` 当前未配置平台分支保护，操作纪律仍需人工遵守；如启用 GitHub Ruleset，应阻止强推和删除，同时不得强制与本地集成流程冲突的远端 PR。

当前发布授权只覆盖既有 `tio2-malaysia` 项目的 `*.vercel.app` 默认域名。自定义域名、DNS、OCI 与旧 WordPress 环境均不在该流程范围内；增加这些目标必须另行设计、授权和验证。

## 验证与证据

运行方式见 README。Google Chrome 和 Python 仅用于本地静态预览验证；生产只需要 out 静态制品。先确认 8333 未被他人占用，不停止其他任务服务。

测试、代码审查、页面独立验收、集成与生产验证分别记录。用户已确认原三页 Gate9 通过；迁移验证不重做 Gate9，也不编造回执。物理设备和人工读屏等未测项如实列出。

历史证据原样保留；新任务用新证据目录。秘密、.env、私钥及敏感备份不进入 Git。无授权不操作旧 WordPress 仓库、数据和线上站点。

## 接单与交回

接单确认本次批准内容、设计、验收条件、可改范围及停止点；先核对已有代码和共享能力，再决定实现方案。缺少业务决定交原责任方，交付表达不清交D23，普通技术选择由本项目处理。开发按本文件执行，不另建Gate 8 Agent或一套开发规则。

交回提供批准输入、实现提交、可访问候选、实际测试证据及开放项；按具体任务选定的D23验收交接协议提供所需清单。协议约束证据交换，不替代本仓库的分支、技术和发布规范。验收候选可使用独立制品和预览环境保持可访问，日常开发可继续；替换候选时交代差异并重新绑定证据。自检、独立页面验收、集成和发布结论分开。

相同候选、范围、环境且无新疑点的证据可复用；工作项、合并组合与实际发布候选的验证分别保留。纯文档工作项检查规则、路径和差异，不把未运行的网站测试记为通过。

正式发布按D23当前批准的canonical、robots、sitemap及可抓取内容要求验收，Google实际收录由发布责任方在发布后跟踪。预览限制与正式发布条件分别记录；历史批次的noindex不成为永久规则。特殊页面或域名的批准来源冲突交D23澄清，不由开发猜测。文档同步不等于现有代码或部署已满足这些条件，外部操作仍按原授权。
