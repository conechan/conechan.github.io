import { PrismLight } from 'react-syntax-highlighter';
import apacheconf from 'react-syntax-highlighter/dist/esm/languages/prism/apacheconf.js';
import nasm from 'react-syntax-highlighter/dist/esm/languages/prism/nasm.js';
import shellSession from 'react-syntax-highlighter/dist/esm/languages/prism/shell-session.js';

// Extend the same Prism instance used by Apps SDK UI's CodeBlock.
PrismLight.registerLanguage('apacheconf', apacheconf);
PrismLight.registerLanguage('nasm', nasm);
PrismLight.registerLanguage('shell-session', shellSession);

/** @type {Record<string, string>} */
const aliases = {
  shell: 'bash', sh: 'bash', console: 'bash',
  shellsession: 'shell-session',
  html: 'markup', xml: 'markup',
  asm: 'nasm', apache: 'apacheconf',
  js: 'javascript', ts: 'typescript', py: 'python',
  yml: 'yaml', md: 'markdown', dockerfile: 'docker',
};
const supported = new Set([
  'javascript', 'jsx', 'typescript', 'tsx', 'markup', 'css', 'scss', 'c',
  'clike', 'bash', 'json', 'jsonc', 'python', 'sql', 'diff', 'markdown',
  'yaml', 'toml', 'docker', 'java', 'go', 'php', 'ruby', 'kotlin',
  'apacheconf', 'nasm', 'shell-session',
]);

export function codeLanguage(language = '', code = '') {
  const name = language.trim().toLowerCase();
  const resolved = aliases[name] || name;
  if (resolved === 'bash' && /^\S+@[^\s:]+:[^\n]*[#$] /m.test(code)) return 'shell-session';
  return supported.has(resolved) ? resolved : 'text';
}
