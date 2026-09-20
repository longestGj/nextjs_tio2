# Vercel 默认域名自动发布方案

状态：用户已批准架构、安全、测试与回滚设计；等待书面规范审阅。本规范不授权自定义域名、DNS 或 OCI 变更。

## 目标与范围

将 `https://github.com/longestGj/nextjs_tio2` 的本地发布流程扩展为：本地 develop 集成验证、本地 main、推送远端 main、GitHub Actions 自动测试、测试通过后部署到 Vercel 默认域名。

第一阶段只发布当前三个静态页面：`/`、`/products/`、`/products/m-350/`。不添加页面、表单、WordPress、数据库、运行时 API 或分析服务；不改变 canonical、`noindex, nofollow` 和已批准内容。OCI 站点、域名及 DNS 保持不变，因此 Vercel 首次部署不会切换现有正式流量。

## 方案选择

采用 GitHub Actions 控制部署，不启用 Vercel Git 自动部署，也不以本机 `vercel --prod` 作为日常发布入口。这样同一提交只有一个自动发布通道，且 Vercel 部署必须依赖远端测试成功。

复用 Vercel 团队 `ailong-s-projects` 下现有空项目 `tio2-malaysia`（项目 ID `prj_vxp7XjRC0UtIhicg8LFAxYX1lqyO`）。该项目使用 Next.js preset、Node.js 24.x，当前没有 Production URL。不得创建同名或重复项目。

## 发布流水线

新增一个仅由 `push` 到 `main` 触发的 GitHub Actions workflow。工作流使用单一顺序依赖链：

1. 以只读仓库权限检出触发 SHA。
2. 使用 Node.js 24 和 `npm ci` 安装锁定依赖，安装与测试配置匹配的 Google Chrome/Playwright 系统依赖。
3. 依次运行 `npm run typecheck`、`npm run build`、`npm test`。任何命令失败，部署 job 不运行。
4. 使用固定版本 Vercel CLI 拉取 production 配置，执行 `vercel build --prod`，再执行 `vercel deploy --prebuilt --prod`。部署的是同一 GitHub SHA 生成的制品，不从其他分支取代码。
5. 捕获 Vercel 返回的部署 URL，并验证三个路由返回成功、关键静态资源可读取、canonical 仍指向 `https://tio2products.com`、robots 仍为 noindex。验证结果和部署 URL保留在 GitHub Actions 日志与 Vercel Deployment 记录中。

工作流固定第三方 Action 的完整提交 SHA，并固定 Vercel CLI 版本；版本升级作为独立任务审查。并发组按 production 串行执行，不自动取消已经开始的发布，避免两个 main 提交交叉部署。

## 凭据与配置

创建专用于 `nextjs_tio2` GitHub Actions 的 Vercel Access Token，保存为仓库 Secret `VERCEL_TOKEN`。不读取、不迁移、不提交本机 Vercel CLI 登录令牌。Token 不出现在命令输出、测试证据或 Git 历史；若日志意外暴露，立即撤销并替换。

从本地安全链接到既有项目后取得组织和项目标识，分别保存为 GitHub Repository Variables `VERCEL_ORG_ID` 与 `VERCEL_PROJECT_ID`。工作流显式引用这三个名称。`.vercel/` 始终被 Git 忽略；本地生成的项目链接文件不提交。

工作流权限只授予 `contents: read`。不配置自定义域名、DNS、Web3Forms 或其他生产凭据。GitHub 仓库为公开仓库，但 secret 只注入 main 的部署 job，普通构建步骤不打印环境。

## 分支与变更流程

实现从最新本地 develop 创建功能分支，先完成测试与审查，再合回本地 develop。对合并后的 develop 运行完整验证；通过后本地 main 仅快进到相同 SHA，再推送 origin/main。不得直接在 main 编写或修复工作流。

首次 workflow 文件随已测试的 main 推送触发。GitHub Actions 对该提交重新测试并部署。以后仍只有 origin/main 是常规推送目标；develop 和功能分支不常规推送，因此本阶段不提供 Vercel 分支预览。

## 验证与完成标准

实施验证分为四层：

- 本地：workflow 语法和固定 Action 引用检查；现有 typecheck、build、37 项浏览器测试通过。
- Vercel 构建：在链接项目的 production 配置下成功生成 `.vercel/output`；不依赖旧仓库、OCI、WordPress 或本机未提交文件。
- GitHub：main workflow 的测试 job 和部署 job 均成功，运行记录绑定推送 SHA；Secret 值不出现在日志。
- 线上默认域名：Home、Products、M350 返回 200，内部导航和资源可用，无 WordPress/API 请求；canonical/noindex 与批准状态一致。

完成时记录项目 ID、团队、GitHub workflow URL、Vercel deployment ID/URL、部署 SHA、测试数量和未测试项。页面 Gate9 结论沿用用户确认，本任务不重新进行内容验收。物理设备、人工读屏和自定义域名不在本阶段验证范围。

## 失败、回滚与恢复

测试、Vercel build 或 deploy 失败时，不伪造成功，不重复无因重跑；定位原因后从 develop 创建修复分支。由于第一阶段不接管正式域名，失败不影响 OCI 正式流量。

首次 Vercel 部署后的线上烟雾检查若失败，记录失败 deployment，不将其用于域名切换；修复后由新的 main SHA产生新部署。已有上一份良好 Vercel Production Deployment 后，可用 Vercel rollback 恢复上一份，再验证三个路由。Hobby 计划只依赖立即上一份生产部署，不假定任意历史版本可直接回退。

## 明确不做

- 不连接 `tio2products.com`，不修改 DNS、SSL、OCI、WordPress 或现有生产数据库/媒体。
- 不启用 Vercel Git 自动部署，不建立重复 Vercel 项目。
- 不提交 `.vercel/`、Access Token、环境文件或部署制品。
- 不把“默认域名部署成功”描述为正式域名上线。
- 不删除 OCI 旧站或其回滚能力。
