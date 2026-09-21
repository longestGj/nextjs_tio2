# RFQ 页面原版迁移方案

状态：用户于 2026-09-21 明确决定“原来是什么样子的，我们就按照什么样子，不需要我们自己来创造新的”，并确认 RFQ 工作项同时包含原版 `/thank-you/` 与 `/privacy-policy/`。本方案以当前线上对应页面为唯一产品与内容基线，不新增字段、文案或业务流程。

## 目标与边界

在独立 Next.js 静态站实现全站通用 `/request-a-quote/`、其成功落点 `/thank-you/` 和表单引用的 `/privacy-policy/`，沿用现有共享 Header、Footer、Menu 与 Cookie Settings。页面内容、字段、选项、校验、预填和提交状态必须与线上原版一致，仅做适配当前仓库结构和静态发布方式所必需的迁移。

旧 `D:/32Wordpress_new` 仓库只实现了 RFQ 入口，没有 RFQ 接收页，因此不作为接收页基线。不得用首页 RFQ 摘要反推表单，不自行补充附件、营销同意、验证码、后端、数据库或新字段。

## 页面内容

- Breadcrumb：`Home` → `Request a Quote`。
- Eyebrow：`B2B QUOTATION REQUEST`。
- H1：`Request a Titanium Dioxide Quote`。
- Hero 正文、表单说明、辅助文字、隐私提示、按钮文字和其他请求类型模块逐字沿用线上原版。
- SEO title：`Request a Titanium Dioxide Quote | TiO2 Malaysia`。
- SEO title、description、语言、WebPage 与 BreadcrumbList 结构化数据沿用线上原版；canonical 使用当前独立仓库既定 origin `https://tio2products.com`，不在本工作项切换域名。全站仍保持 `noindex, nofollow`，直到另有索引授权。

## 表单字段

| 分组 | 字段 | Payload key | 要求 |
|---|---|---|---|
| YOUR REQUIREMENT | Product / Grade | `grade_id` | 必填下拉 |
| YOUR REQUIREMENT | Application | `application_id` | 必填下拉 |
| YOUR REQUIREMENT | Required Quantity | `quantity_mt` | 必填数字，必须大于 0；固定 `quantity_unit=MT` |
| YOUR REQUIREMENT | Destination Country | `destination_country` | 必填，最多 100 字符 |
| YOUR REQUIREMENT | Destination Port / City | `destination_port_city` | 选填，最多 120 字符 |
| COMPANY DETAILS | Company Name | `company_name` | 必填，2–160 字符 |
| COMPANY DETAILS | Your Name | `contact_name` | 必填，2–100 字符 |
| COMPANY DETAILS | Business Email | `business_email` | 必填，最多 254 字符并校验邮箱格式 |
| COMPANY DETAILS | Phone / WhatsApp | `phone_whatsapp` | 选填，最多 40 字符 |
| COMPANY DETAILS | Website | `website` | 选填，最多 2048 字符，只接受无凭据的完整 HTTP/HTTPS 地址 |
| ADDITIONAL REQUIREMENTS | Additional Requirements | `additional_requirements` | 选填，最多 2000 字符；不增加附件 |

Product / Grade 选项按原顺序：`M-350`、`M-510`、`M-896`、`M-996`、`M-2196`、`M-895`、`M-200`、`M-108`、`M-210`、`M-340`、`M-886`、`M-52`、`M-2377`、`CR-901`、`Not sure / Need help`。

Application 选项按原顺序：`Coatings`、`Plastics`、`Masterbatch`、`Printing Inks`、`Paper`、`Specialty Materials`、`Other / Not sure`。

## 交互与状态

- 使用受控表单和原版逐字段校验；禁用浏览器默认校验汇总，提交失败时显示可聚焦的错误摘要和字段内错误，并保留其他输入。
- 提交中禁用字段和按钮，按钮显示 `SUBMITTING…`；防止重复提交。
- 网络错误、超时、限流、服务拒绝或无法确认结果时，不显示假成功；保留输入并提供 `TRY AGAIN`。
- 接收配置不可用时显示原版 temporarily unavailable 状态，不渲染可提交的假表单。
- Web3Forms 明确接受后才进入成功流程。原版记录一次性浏览器 receipt，并跳转 `/thank-you/?request=quote`。
- 页面从允许的查询参数预填 Grade、Application、Destination Country 和 Additional Requirements；只接受原版白名单值。现有 M350 与全站共享 RFQ 链接继续保持原版 clean URL，不自行增加自动预填参数。
- 仅把原版允许的四个草稿字段保存在当前 history state 中，不使用数据库或长期浏览器存储保存业务表单内容。

## Web3Forms 边界

- 浏览器直接向 `https://api.web3forms.com/submit` 发送 JSON；不建立自有 API 或接收后端。
- Payload 字段名、固定标识、主题、请求 token 和可选来源上下文保持原版兼容。
- Web3Forms routing key 通过构建/部署配置提供，不提交到 Git。它在静态客户端中最终可见，但不得在日志、证据或聊天中输出实际值。
- 自动测试拦截提交请求并验证 payload、成功、拒绝、超时和重复提交，不向真实收件端发送测试邮件。

## Thank You 页面

- Web3Forms 明确接受 RFQ 后，写入结构固定的一次性 session receipt 并前往 `/thank-you/?request=quote`。
- receipt 包含 `version`、`request`、`succeededAt` 与随机 `flowId`，仅保存在 `sessionStorage`，有效期 10 分钟。
- 只有查询参数恰好包含一个受支持的 `request=quote`、receipt 结构合法、类型相同且未过期时，才显示原版 `REQUEST RECEIVED`、RFQ 成功标题、正文及 `Explore Products`、`Go to Homepage` 操作。
- 缺少、重复、无效、未来时间、过期、类型不匹配或无法读取 storage 时，显示原版直接访问状态：`How can we help?`，以及 Quote、Documents、Sample 三个入口；不得根据 URL 单独显示假成功。
- 页面使用 `CONV-THANK` 身份、原版 SEO 和共享 Chrome；不增加服务端会话或数据库。

## Privacy Policy 页面

- 迁移线上原版英文 `/privacy-policy/` 全文、目录、十个章节、联系信息、地址、Web3Forms 处理说明、保存期限、Cookie/Analytics 现状、权利与安全说明，保留 `Last updated: 5 September 2026`。
- 保留原版对 RFQ 字段、来源上下文、Web3Forms 浏览器直传、国际处理、30 天 dashboard 可见期与最长三年物理保留说明；不得缩写或重新解释法律文案。
- 保留 `info@tio2malaysia.com` 联系方式、马来文隐私政策和 Cookie Policy 链接及 Cookie Settings 操作。尚未实现的马来文隐私与 Cookie Policy 路由继续如实列为依赖，不创建替代文案。
- 页面使用原版 SEO、结构化数据、共享 Chrome 和法律页版式；全站 `noindex, nofollow` 边界不变。

## 剩余依赖与发布边界

本工作项实现 `/request-a-quote/`、`/thank-you/` 与 `/privacy-policy/`。`/request-sample/`、`/request-documents/`、`/privacy-policy-bm/` 与 `/cookie-policy/` 继续作为明确的后续页面依赖，保留原版真实链接，不创建假页面、假成功响应或替代内容。

## 验证标准

1. `/request-a-quote/`、`/thank-you/` 与 `/privacy-policy/` 静态导出成功，直接访问和刷新返回正确页面。
2. 页面内容、字段、顺序、选项、必填状态、长度限制、辅助文案、错误文案和响应式布局与线上原版一致。
3. Header、Footer、Menu、Cookie Settings 复用现有唯一实现，当前页导航状态正确。
4. 允许的查询参数正确预填；未知、越界或不允许的值不进入表单。
5. 客户端校验、焦点、错误摘要、ARIA 状态、键盘操作、提交中、失败重试和不可用状态通过浏览器测试。
6. Web3Forms 请求在测试中被拦截，不产生真实邮件；接受后才创建 receipt 并进入成功路径，拒绝、429、超时和网络失败均不得假成功。
7. Thank You 对有效、缺失、重复、过期、未来时间、类型不匹配和损坏 receipt 的行为与原版一致；URL 本身不能伪造成功。
8. Privacy Policy 的日期、十个章节、RFQ 字段说明、Web3Forms、保存期限、联系信息和法律链接逐项核对原版。
9. 更新本地页面测试、静态路由检查、Vercel output 路由数量及生产烟雾检查，使结果绑定实际候选 SHA。
10. 未实现的 Sample、Documents、BM Privacy 与 Cookie Policy 依赖如实记录，不推断这些页面已完成。

## 后续执行

本方案批准后，在 `codex/rfq-page` 隔离 worktree 中先写执行计划，再按测试驱动方式迁移。完成后依次进行功能分支验证、本地 `develop` 集成、候选复核、本地 `main` 快进及经授权的远端发布；不得从 RFQ 分支直接合入 `main`。
