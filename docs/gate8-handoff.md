# Gate 8开发与D23交接

2026-09-21：用户批准统一规则，不建立独立Gate 8 Agent。本项目负责在已批准Next.js静态导出架构内自主实现、测试、必要回归、交回和定向修复。D23提供内容、视觉、行为与验收依据，Gate 9独立只读核验。

源规则：`D:/23MySec/docs/architecture/GATE8_CURRENT_RULES_V1.0.md`、`GATE8_GATE9_EVIDENCE_HANDOFF_CONTRACT_V1.1.md`及`STATIC_NEXTJS_SINGLE_SITE_AND_GOOGLE_INDEXING_DECISION_V1.0.md`。这些是工作输入，不得成为网站运行依赖。

不引入WordPress、CMS、数据库、多站scope或自建表单后台。普通技术选择归开发；改变批准内容/行为或共享约束交原owner。当前仓库Git、测试、集成和发布仍按CONTRIBUTING，不继承D16本地main队列。

正式发布页面须具有当前批准的正式canonical、可索引robots、sitemap和实质初始内容；Google实际索引由发布责任方发布后跟踪。预览防索引按环境记录，并列正式发布前解除条件。历史部署方案的noindex或域名示例不覆盖最新批准决定。特殊fallback/结果页如有合同冲突，先交D23确认适用范围，不猜测新URL或状态。此文档更新不表示现有代码或部署已符合新索引目标。

交回一个入口，包含批准包、Page ID/AC、指定实现、完整静态制品、访问方式、测试证据和开放项。新静态候选使用Manifest V1.1：提交中保存证据和制品绑定清单，Manifest在提交后生成于仓库外；制品本身不要求提交。哈希按指定提交中的证据原字节和实际制品分别计算。D23工具校验响应与制品hash；不靠冻结日常开发HEAD证明身份。保留验收用独立候选，直到Gate 9通知通过、退回或释放。

旧V1.0回执按原格式兼容，不改写历史证据。开发自检不等于Gate 9通过；页面通过、集成通过和正式发布分开。推送会触发发布，须遵守具体已有授权；本次规则修订不授权推送、部署、自定义域名、DNS或Search Console提交。
