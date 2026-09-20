# 开发与发布流程

本仓库是独立 Next.js 静态站，D23 负责策划、文案与批准输入，本项目负责开发和发布。普通页面变更复用现有组件，不建立 CMS 或自己的表单接收服务。

## Git

本地功能分支 → 本地 develop → 集成测试 → 本地 main 快进到相同 SHA → 经授权推送远端 main → 自动测试和发布。

新功能/修复/文档从最新本地 develop 创建 codex/ 分支；完成后合回本地 develop。功能分支和 develop 不常规推送。main 是发布指针，不能直接开发，也不从功能分支直接合入。

集成验证执行 npm run typecheck、npm run build、npm test；任何代码组合变化都需验证实际候选。失败时保持 main 不变，从 develop 建修复分支。每个独立且通过验证的工作项一个 commit，检查 git diff、git diff --cached 和 git diff --cached --check。

初始化例外：首次 develop 仅提交治理文件，main 从此建立起点；应用仍通过功能分支导入与集成。`origin` 是 `https://github.com/longestGj/nextjs_tio2.git`，仅 `main` 是常规推送目标。

远端 `main` 的 push 触发 GitHub Actions：先对该 SHA 执行锁定依赖安装、类型检查、静态构建和完整测试；只有 test job 成功，deploy job 才能用固定版本 Vercel CLI 发布同一 SHA，并对返回的默认域名执行生产烟雾检查。GitHub Actions 是唯一自动发布入口，不连接 Vercel Git integration。所需配置为 variables `VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` 和专用 secret `VERCEL_TOKEN`，秘密不得出现在提交、日志或聊天中。

当前发布授权只覆盖既有 `tio2-malaysia` 项目的 `*.vercel.app` 默认域名。自定义域名、DNS、OCI 与旧 WordPress 环境均不在该流程范围内；增加这些目标必须另行设计、授权和验证。

## 验证与证据

运行方式见 README。Google Chrome 和 Python 仅用于本地静态预览验证；生产只需要 out 静态制品。先确认 8333 未被他人占用，不停止其他任务服务。

测试、代码审查、页面独立验收、集成与生产验证分别记录。用户已确认原三页 Gate9 通过；迁移验证不重做 Gate9，也不编造回执。物理设备和人工读屏等未测项如实列出。

历史证据原样保留；新任务用新证据目录。秘密、.env、私钥及敏感备份不进入 Git。无授权不操作旧 WordPress 仓库、数据和线上站点。
