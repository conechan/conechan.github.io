# cone.cc

## Platform
Web; static personal blog deployed through Cloudflare Pages at https://cone.cc. The www.cone.cc and conechan.pages.dev aliases redirect to the canonical domain, preserving paths and query strings.

## Stack
Astro, React islands, Apps SDK UI and Tailwind CSS. User explicitly requested this migration and deployment.

## Product purpose
Read and browse the existing Chinese articles in a single chronological list. Preserve the author's identity, article contents, images, historical messages stored in the article bodies, and dated URLs. Legacy archive, about and category routes remain available for compatibility.

## Evidence
The original `_posts/`, `img/` and `about.md` remain the content sources. Retired Jekyll templates and assets are recoverable from Git history. The source contains writing about technology, travel, piano and daily life. Do not invent biography, articles or publication dates. Historical content repairs and unrecoverable references are documented in `docs/content-repairs.md`.

## Constraints
Preserve `/:year/:month/:day/:title`, `/archive/`, `/about/`, `/img/`, favicon and Atom feed. Keep Markdown, embedded HTML and legacy Liquid highlight compatibility. The domain migration and canonical redirects are complete. The site has no search or live comment system; historical messages embedded in articles are retained. GitHub Actions checks changes; Cloudflare Pages handles production deployment.

## Brand commitments
Latest user direction: reference https://maintao.com/ and use a complete single-column chronological page instead of a fixed Codex sidebar. Keep restrained neutral controls. The site remains cone.cc, not an OpenAI-branded product.
