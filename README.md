# cone.cc

个人博客。使用 Astro 静态生成，React + Apps SDK UI 提供主题切换控件。
首页参考 maintao.com，采用单栏、按年分组的完整文章列表。

## 本地开发

需要 Node.js 24.15.0（见 `.node-version`）。

```sh
npm ci
npm run dev
```

打开终端打印的本地地址，页面内容支持热更新。

查看与线上一致的构建产物：

```sh
npm run build
npm run preview
```

## 内容与兼容

- 文章继续写在 `_posts/YYYY-MM-DD-slug.md`，Front Matter 保持 `title`、`description`、`categories`、`tags`。
- 原有 213 篇文章未改写，日期与链接由原文件名生成：`/YYYY/MM/DD/slug`。
- `img/` 保持原位置。构建脚本只复制 `scripts/assets.json` 列出的公开资源；添加新公开图片时同步更新该清单。被 Git 忽略的本地简历图片不会发布。
- 保留 `/archive/`、`/about/`、`/atom.xml`、`/favicon.ico` 和 `/img/...`。
- 兼容 Markdown 内嵌 HTML 以及 Jekyll `{% highlight %}` 代码块。
- 原 Jekyll 模板和配置保留作历史参考，Astro 只从 `src/` 生成页面。
- 远端图片保留原始地址，其可用性由原图片托管方决定。
- 网站不加载评论系统；原文章正文中已经保存的历史留言继续保留。

## 校验

```sh
npm run check
npm test
npm run build
```

构建后自动校验全部原文章路由、公开资源字节一致性、Atom和 404 页面。

## Cloudflare Pages

- 仓库：`conechan/conechan.github.io`
- 项目：`conechan`，正式地址：`https://cone.cc`，Pages 地址：`https://conechan.pages.dev`
- 生产分支：`master`
- 框架：Astro
- 构建命令：`npm run build`
- 输出目录：`dist`
- 根目录：仓库根目录
- 无需 Astro Cloudflare 服务端适配器，也不需要 API Key。

GitHub Pages 的发布来源已切换为 GitHub Actions，仓库未配置 Pages 发布工作流，因此不再自动运行旧 Jekyll 构建。网站由 Cloudflare Pages 的 GitHub 集成发布。

Cloudflare 账户中的 Bulk Redirects 列表 `cone_canonical_redirects` 和规则 `Redirect blog aliases to cone.cc` 将 `www.cone.cc`、`conechan.pages.dev` 以 301 永久跳转到 `https://cone.cc`，保留文章路径和查询参数。这些跳转由 Cloudflare 账户配置管理，不在 Astro 构建产物中。

提交到生产分支会由 Pages 的 GitHub 集成自动构建。备用手动部署方式：

```sh
npm run build
npx wrangler pages deploy dist --project-name conechan
```

站点 URL 在 `astro.config.mjs` 中设置为 `https://cone.cc`，用于生成 canonical、站点地图、robots 和订阅链接。Atom 保留历史条目 ID，避免已有阅读器重复收录。自定义域名需在 Cloudflare Pages 中绑定；仓库中的旧 `CNAME` 不用于配置 Cloudflare Pages。
