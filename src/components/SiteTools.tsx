import { useEffect, useRef, useState } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Input } from '@openai/apps-sdk-ui/components/Input';
import { Tooltip } from '@openai/apps-sdk-ui/components/Tooltip';
import { Monitor, Moon, Search, Sun, X, ArrowUpRight } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';
type Result = { url: string; meta: { title?: string }; excerpt: string };
type Pagefind = { search: (query: string) => Promise<{ results: { data: () => Promise<Result> }[] }> };
const labels = { system: '跟随系统', light: '浅色', dark: '深色' };
let index: Promise<Pagefind> | undefined;
const pagefindPath = '/pagefind/pagefind.js';
const loadIndex = (): Promise<Pagefind> => index ??= import(/* @vite-ignore */ pagefindPath).catch((error) => { index = undefined; throw error; });

export default function SiteTools() {
  const [theme, setTheme] = useState<Theme>('system');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const openSearch = () => { setOpen(true); dialog.current?.showModal(); };
  const closeSearch = () => { dialog.current?.close(); setOpen(false); };

  useEffect(() => {
    try { const saved = localStorage.getItem('cone-theme'); if (saved && ['system', 'light', 'dark'].includes(saved)) setTheme(saved as Theme); } catch { /* Preferences are optional in private browsing. */ }
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) closeSearch(); else openSearch();
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme; };
    apply(); media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const text = query.trim();
    if (!text) { setResults([]); setTotal(0); setStatus('输入关键词，搜索全部文章。'); return; }
    setStatus('正在搜索…');
    const timer = setTimeout(async () => {
      try {
        const pagefind = await loadIndex();
        const found = await pagefind.search(text);
        const data = await Promise.all(found.results.slice(0, limit).map((result) => result.data()));
        if (active) { setResults(data); setTotal(found.results.length); setStatus(found.results.length ? `找到 ${found.results.length} 篇文章，已显示 ${data.length} 篇` : '没有找到相关文章，试试其他关键词。'); }
      } catch {
        if (active) { setResults([]); setTotal(0); setStatus('搜索索引暂时无法加载。请刷新重试，或从归档中查找。'); }
      }
    }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [query, open, limit]);

  const cycleTheme = () => {
    const next = ({ system: 'light', light: 'dark', dark: 'system' } as const)[theme];
    setTheme(next); try { localStorage.setItem('cone-theme', next); } catch { /* Keep the session preference. */ }
  };
  const ThemeIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;
  return <div className="site-tools">
    <Tooltip content="搜索文章 · ⌘ / Ctrl K" compact>
      <Button color="secondary" variant="ghost" size="lg" pill={false} aria-label="搜索文章" onClick={openSearch}><Search size={18} strokeWidth={1.7} /></Button>
    </Tooltip>
    <Tooltip content={`主题：${labels[theme]}，点击切换`} compact>
      <Button color="secondary" variant="ghost" size="lg" pill={false} aria-label={`主题：${labels[theme]}，点击切换`} onClick={cycleTheme}><ThemeIcon size={18} strokeWidth={1.7} /></Button>
    </Tooltip>
    <dialog ref={dialog} className="search-dialog" aria-labelledby="search-title" onClose={() => setOpen(false)} onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) closeSearch(); }}>
      <div className="search-inner">
        <div className="search-heading"><h2 id="search-title">搜索文章</h2><Button color="secondary" variant="ghost" size="lg" aria-label="关闭搜索" onClick={closeSearch}><X size={18} /></Button></div>
        <Input aria-label="关键词" type="search" placeholder="搜索技术、旅行、音乐…" size="xl" autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setLimit(20); }} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeSearch(); } }} startAdornment={<Search size={18} />} />
        <p className="search-status" role="status" aria-live="polite">{status || '输入关键词，搜索全部文章。'}</p>
        <ul className="search-results">{results.map((result) => <li key={result.url}><a href={result.url}><span>{result.meta.title || '未命名文章'}</span><ArrowUpRight size={16} aria-hidden="true" /><p dangerouslySetInnerHTML={{ __html: result.excerpt }} /></a></li>)}</ul>
        {results.length < total && <Button color="secondary" variant="soft" size="lg" block onClick={() => setLimit((count) => count + 20)}>显示更多结果</Button>}
        <div className="search-bottom"><a href="/archive/">浏览全部归档</a><span><kbd>Esc</kbd> 关闭</span></div>
      </div>
    </dialog>
  </div>;
}
