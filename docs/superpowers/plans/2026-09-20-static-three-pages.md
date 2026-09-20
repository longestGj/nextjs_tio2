# Three Static Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 用户已选择 native；保留该选择。Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 交付可在本地预览的首页、Products 集合页和 M350 详情页，完全不依赖 WordPress。

**Architecture:** 在 D32 的 `static-site/` 内建立静态导出的 Next.js 应用。页面组件复用 D16 实现，内容核对 D23 当前批准输入后放入本仓库，构建时读取；共享组件只有一份。旧站及发布配置不动。

**Tech Stack:** Next.js App Router、React、TypeScript、CSS Modules、Playwright。依赖版本参考 D16 的 lockfile，实施时核对其兼容性及已知安全修复后固定版本并生成独立 lockfile，不复制 D16 全部依赖。

**Spec:** `docs/superpowers/specs/2026-09-20-static-three-pages-design.md`，用户已批准。

**状态:** 用户已批准 native 执行；四项实现已完成，最终审查与证据见 `docs/handoffs/STATIC-THREE-PAGES.md`。

## Global Constraints

- 本批仅实现三个英文页面：`/`、`/products/`、`/products/m-350/`。
- 不新增其他产品详情页、询价页、后台、数据库、内容 API 或通用页面管理器。
- 不删除旧 WordPress 实现，不切换生产环境。
- D16 仅提供可复用实现，不自动成为新版文案依据。
- 当前 D32 canonical 域名为 `https://tio2products.com`。
- 询价表单确定采用 Web3Forms，浏览器直接提交，无自建接收后端；本批不新增询价页，也不宣称询价链路已打通。
- 不启用索引，沿用当前 noindex 边界。
- 审批编号和本机路径仅作开发追溯，不进入访客页面。
- 保存新的测试结果与截图，不覆盖旧验收证据。
- 本批不擅自触发生产部署。

## Review Focus

1. 复制 D16 后残留 WordPress、服务端 cookie 或归因接口：断开这些依赖仍能构建和浏览（Task 1、4）。
2. 未实现的其他产品被输出为可用链接或 Schema URL：只允许 M350 详情入口（Task 2）。
3. 旧 M350 数据覆盖 D23 批准技术参数：逐字段核对来源，缺失和冲突不补造（Task 3）。
4. 静态导出后深链接刷新和图片失败：直接请求每个导出路径并验证资源（Task 4）。
5. 手机筛选、菜单或 FAQ 无法操作：真实浏览器验证键盘、状态变化和窄屏溢出（Task 2、4）。

## 文件与接口

所有下列路径相对隔离 worktree；不编辑 D16、D23。先核对当前 worktree 的 status 和 develop 差异，保留其他任务改动，不更新他人的 develop 工作区。

| 文件 | 职责 |
|---|---|
| `static-site/package.json`、`package-lock.json`、`tsconfig.json`、`next.config.ts` | 独立构建配置 |
| `static-site/app/layout.tsx`、`globals.css` | 根布局、字体、基础样式及 noindex |
| `static-site/app/page.tsx` | 首页入口 |
| `static-site/app/products/page.tsx` | Products 入口 |
| `static-site/app/products/m-350/page.tsx` | 唯一的产品详情入口；不用动态路由 |
| `static-site/content/home.json`、`products.json`、`m350.json`、`chrome.json` | 核对后的内容 |
| `static-site/lib/content/page-data.ts`、`types.ts` | 导出类型化页面数据，不读取远端 |
| `static-site/lib/seo.ts` | 本站元数据及安全序列化的 JSON-LD |
| `static-site/components/sites/tio2-my/` | 从 D16 按依赖闭包迁移三个页面及共享组件、CSS；移除服务端依赖 |
| `static-site/public/` | 页面实际使用的本站静态资源 |
| `static-site/playwright.config.ts`、`tests/pages.spec.ts` | 浏览器验证及静态服务配置 |
| `static-site/README.md` | 独立安装、构建、预览、测试命令 |
| `docs/handoffs/STATIC-THREE-PAGES.md` | 内容来源、版本、证据、未完成依赖 |
| 根 `README.md`、`CONTRIBUTING.md` | 补充静态试点入口和边界；不把现有 WP 发布流程称为支持静态发布 |

`page-data.ts` 导出 `home`、`products`、`m350`，分别满足迁移后的 `MalaysiaHomepageDto`、`MalaysiaProductHubDto`、`MalaysiaProductDetailDto`。这些类型定义来自 D16 对应 types 文件，去除审批和多站点运行依赖；内容映射在构建期执行。组件继续接收 `{homepage: home}`、`{productHub: products}`、`{product: m350}`，不通过网络查询。

## Task 1: 独立静态应用、共享组件和首页

**Files:** 上表构建配置、根布局、首页入口、home/chrome 内容、共享组件、`tests/pages.spec.ts`。

**Interfaces:** 产出类型化 `home`，以及迁移后的 `MalaysiaHomepage`、`MalaysiaGlobalHeader`、`MalaysiaGlobalFooter`。后续两页消费同一套全局组件。

- [x] 核对 D23 Home Manifest V1.12 的批准输入及 D32 已验收内容，保存来源路径和 SHA-256 到交付记录；文件路径不进入 public 或页面数据。迁移 D16 的 `homepage/malaysia-homepage.tsx`、CSS、`responsive-product-groups.tsx`、RootPageHero 和共享 chrome 的必要依赖。
- [x] 先建立测试配置，再添加首页浏览器契约；在没有首页实现时运行，确认因为页面不存在而失败，而不是浏览器或服务无法启动。

```ts
import {test, expect} from '@playwright/test'

test('home renders independently of WordPress', async ({page}) => {
  await page.route(/wp-json|graphql|\/api\//, route => route.abort())
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.locator('footer')).toHaveCount(1)
  await expect(page.locator('a[href="/products/"]').first()).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
```

- [x] 实现静态配置、根布局及首页，保持 D23 批准内容和 D16 可复用设计；询价链接替换为普通链接，不调用 `/api/rfq/context`。配置和入口核心如下：

```ts
// next.config.ts
import type {NextConfig} from 'next'
const config: NextConfig = {
  output: 'export', trailingSlash: true, images: {unoptimized: true},
}
export default config
```

```tsx
// app/page.tsx
import {MalaysiaHomepage} from '@/components/sites/tio2-my/homepage/malaysia-homepage'
import {home} from '@/lib/content/page-data'
export default function Page() { return <MalaysiaHomepage homepage={home} /> }
```

- [x] 在 `static-site` 执行 `npm run typecheck`、`npm run build`、`npx playwright test -g "home renders"`。Expected: 类型与构建通过；首页测试 PASS；没有 WP 环境变量也能导出首页。
- [x] 检查差异和暂存内容，提交本项文件：`feat: add standalone static homepage`。

## Task 2: 产品集合页与就绪链接

**Files:** Products 页面、products 内容、`products/malaysia-product-hub.tsx`、CSS、`product-selector.tsx`、`product-faq.tsx`、页面数据和测试。

**Interfaces:** 消费 Task 1 全局组件；产出 `products: MalaysiaProductHubDto`。`products.routeReadiness` 只有本批实际实现的路由可为 true；M350 链接在 Task 3 完成后的组合测试中验证。

- [x] 核对 Product Manifest V0.2 及其批准输入，记录目录顺序和筛选分组，迁移所需组件；不复制整个 D16 产品运行系统。
- [x] 添加下面的实际交互测试，在本页不存在时确认 FAIL。

```ts
test('products filters and limits detail links', async ({page}) => {
  await page.goto('/products/')
  const choices = page.getByRole('group').getByRole('button')
  await expect(choices.first()).toHaveAttribute('aria-pressed', 'true')
  await choices.nth(1).click()
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(choices.first()).toHaveAttribute('aria-pressed', 'false')
  const hrefs = await page.locator('a[href^="/products/"]').evaluateAll(
    nodes => nodes.map(node => node.getAttribute('href')),
  )
  expect(hrefs.every(href => href === '/products/' || href === '/products/m-350/')).toBe(true)
  const faq = page.locator('button[aria-controls^="product-faq-answer-"]').nth(1)
  await faq.click()
  await expect(faq).toHaveAttribute('aria-expanded', 'true')
  const answerId = await faq.getAttribute('aria-controls')
  await expect(page.locator(`[id="${answerId}"]`)).toBeVisible()
})
```

- [x] 实现入口；根据实际导出路由赋予 M350 就绪状态，其余详情、Process、Support 保持未就绪；同时过滤结构化数据中的未就绪 URL。

```tsx
import {MalaysiaProductHub} from '@/components/sites/tio2-my/products/malaysia-product-hub'
import {products} from '@/lib/content/page-data'
export default function Page() { return <MalaysiaProductHub productHub={products} /> }
```

- [x] 增加断言，将每个筛选按钮点击后的结果与 `products.selector.applications` 的 gradeIds 对照；检查14个产品身份及顺序与批准来源一致。Expected: 不仅按钮状态改变，实际结果也正确。
- [x] 运行 `npm run typecheck`、`npm run build`、`npx playwright test`。Expected: 当前首页和 Products 测试全部 PASS。
- [x] 提交：`feat: add static product collection`。

## Task 3: M350 详情与三页导航

**Files:** M350 固定路由、m350 内容、详情组件与 CSS、页面数据、SEO、测试。

**Interfaces:** 消费 Task 1 chrome 与 Task 2 产品入口；产出 `m350: MalaysiaProductDetailDto`。不引入14个动态详情路由。

- [x] 核对 M350 Manifest V0.7 绑定的批准组合，逐字段比对技术表、用途及条件模块；旧 D16 JSON 只作映射参考，不覆盖当前批准内容。保存可追溯的来源校验记录。
- [x] 添加如下测试，确认详情未实现时 FAIL。

```ts
test('M350 deep link and collection navigation', async ({page}) => {
  const response = await page.goto('/products/m-350/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toContainText('M-350')
  await page.reload()
  await expect(page.locator('table')).toBeVisible()
  await page.locator('a[href="/products/"]').first().click()
  await expect(page).toHaveURL(/\/products\/$/)
  await page.locator('a[href="/products/m-350/"]').first().click()
  await expect(page.locator('h1')).toContainText('M-350')
})
```

- [x] 实现固定入口和批准数据，移除未就绪模块的可用性暗示；完成三页的 metadata 和 JSON-LD。JSON-LD 序列化至少转义 `<`，禁止未实现详情的 URL 泄漏。

```tsx
import {MalaysiaProductDetail} from '@/components/sites/tio2-my/products/malaysia-product-detail'
import {m350} from '@/lib/content/page-data'
export default function Page() { return <MalaysiaProductDetail product={m350} /> }
```

- [x] 测试技术表每个单元格与经核对的本地内容一致；断言 canonical 为 `https://tio2products.com/products/m-350/`，页面不包含内部编号或开发路径。不得通过删掉批准参数来修复测试。
- [x] 运行 `npm run typecheck`、`npm run build`、`npx playwright test`。Expected: 三页测试全 PASS。
- [x] 提交：`feat: add static M350 product detail`。

## Task 4: 静态制品验证与交付

**Files:** 测试配置、`tests/pages.spec.ts`、`static-site/README.md`、根 README/CONTRIBUTING、`docs/handoffs/STATIC-THREE-PAGES.md`。

**Interfaces:** 仅消费 `static-site/out/` 静态制品；浏览器验收不能以 `next dev` 替代静态托管。

- [x] 用 loopback 静态服务器服务 `out/`，预览端口先检查占用；不关闭他人的服务器，不启动或修改共享 WP 环境。测试配置使用此地址，证据写入本任务独立目录。
- [x] 将以下检查覆盖三页及 390、768、1024、1280、1440 宽度：

```ts
for (const route of ['/', '/products/', '/products/m-350/']) {
  for (const width of [390, 768, 1024, 1280, 1440]) {
    test(`${route} static assets and layout at ${width}`, async ({page}) => {
      await page.setViewportSize({width, height: 900})
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('response', response => {
        if (response.status() >= 400) errors.push(response.url())
      })
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(await page.locator('img').evaluateAll(images =>
        images.filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0),
      )).toBe(true)
      expect(errors).toEqual([])
    })
  }
}
```

- [x] 再实际滚动页面验证懒加载图片；测试菜单打开/关闭、Escape 和焦点归还，Cookie Settings 操作及刷新后的状态；禁用 JS 时核心正文和链接仍可读。检查浏览器无 WP/API 请求。
- [x] 运行独立 `npm ci`、`npm run typecheck`、`npm run build`、`npx playwright test`，检查输出的三个 HTML、资源与 canonical。Expected: 全部通过；记录实际命令、版本与限制，不声称旧 WP 全套测试适用于本应用。
- [x] 保存桌面和手机全页截图并逐页查看；修复本批布局或行为缺陷后重跑对应回归。物理设备、人工读屏等未执行项如实列出。
- [x] 更新文档：完整预览命令、D23 来源、代码/证据版本、剩余 RFQ 等依赖，明确本地完成不等于 Gate9 通过或发布。
- [x] 提交：`test: verify and document static three-page candidate`。
- [x] 按 native 执行流程进行整分支代码审查，修复必修项并验证；最终给出三个本地预览地址和交付记录。不 merge、不 push、不 deploy，不修改旧数据库或媒体。

## 计划自审

范围、三个路由、共享组件、内容分离、无 WP 运行依赖、静态构建、Web3Forms 边界及保留旧环境均映射到上述任务。五个 Review Focus 均有对应检查。执行中若批准内容与旧组件结构冲突，以已批准内容为准，记录最小适配，不擅自改写内容。
