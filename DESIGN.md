# cone.cc design

## Direction
The user superseded the fixed Codex sidebar with maintao.com as the layout reference: one complete chronological archive page, dates in a quiet left column and blue linked titles. Keep the blog name cone.cc; use Apps SDK UI for a small theme control. Read mode; no dashboard, cards, invented biography or decorative illustrations.

## Tokens
Light: page #ffffff, text #292b2e, muted #676c71, link #34688e, line #e9eaec, soft #f4f5f6.
Dark: page #1c1d1f, text #e6e7e9, muted #a2a6ab, link #93bdda, line #33363a, soft #26282b.
Reading width 720px; mobile horizontal padding 20px. Desktop header top 76px; date column 64px; title gap 17px. System sans-serif, body 17px/1.95, archive titles 16px/1.75. Small controls 6–10px radius.

Article code blocks use the official Apps SDK UI CodeBlock composition and CopyButton. Keep its background, border, radius, padding and syntax theme tokens; only article spacing and the accessible copy control wrapper are local. Long lines scroll inside the block. Inline code continues to use the blog's soft surface.

## First viewport and behavior
Wordmark with a theme control on the same row, without primary navigation links; latest actual article titles grouped by year. All 213 articles appear in one page. Article pages preserve dated URLs, original Markdown/HTML and local asset paths. Category filtering, article counts and year jump navigation are omitted. Search is omitted. Theme toggle uses a moon to switch to dark mode and a sun to switch to light mode, remembers the choice, and follows the system until manually changed. No-JS readers can read every article and use archive links. Honor reduced motion and color-scheme changes.
