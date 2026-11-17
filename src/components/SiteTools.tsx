import { useEffect, useRef, useState } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Tooltip } from '@openai/apps-sdk-ui/components/Tooltip';
import { Moon, Sun } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';

export default function SiteTools() {
  const [dark, setDark] = useState(false);
  const preference = useRef<Theme>('system');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cone-theme');
      if (saved === 'light' || saved === 'dark') preference.current = saved;
    } catch { /* Storage is optional in private browsing. */ }
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const nextDark = preference.current === 'system' ? media.matches : preference.current === 'dark';
      document.documentElement.dataset.theme = nextDark ? 'dark' : 'light';
      setDark(nextDark);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    preference.current = next;
    setDark(!dark);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('cone-theme', next); } catch { /* Keep the session preference. */ }
  };
  const label = dark ? '切换到浅色模式' : '切换到深色模式';
  const Icon = dark ? Sun : Moon;

  return <div className="site-tools">
    <Tooltip content={label} compact>
      <Button color="secondary" variant="ghost" size="lg" iconSize="lg" uniform pill={false} aria-label={label} onClick={toggleTheme}>
        <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
      </Button>
    </Tooltip>
  </div>;
}
