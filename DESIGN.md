# cone.cc design

## Direction
The user superseded the fixed Codex sidebar with maintao.com as the layout reference: one complete chronological archive page, dates in a quiet left column and blue linked titles. Keep the blog name cone.cc; use Apps SDK UI for small search/theme controls. Read mode; no dashboard, cards, invented biography or decorative illustrations.

## Tokens
Light: page #ffffff, text #292b2e, muted #676c71, link #34688e, line #e9eaec, soft #f4f5f6.
Dark: page #1c1d1f, text #e6e7e9, muted #a2a6ab, link #93bdda, line #33363a, soft #26282b.
Reading width 720px; mobile horizontal padding 20px. Desktop header top 76px; date column 64px; title gap 17px. System sans-serif, body 17px/1.95, archive titles 16px/1.75. Small controls 6–10px radius; dialog 14px.

## First viewport and behavior
Wordmark, understated navigation, search and theme controls; categories and year jump links; latest actual article titles grouped by year. All 213 articles appear in one page. Article pages preserve dated URLs, original Markdown/HTML and local asset paths. Filters hide only matching rows and empty years. Search is a keyboard-accessible native dialog using SDK Input/Button/Tooltip and Pagefind; Escape and focus restoration use browser dialog behavior. No-JS readers can read every article and use archive links. Honor reduced motion and color-scheme changes.
