import { CodeBlockBase } from '@openai/apps-sdk-ui/components/CodeBlock';
import { CopyButton } from '@openai/apps-sdk-ui/components/Button';
import { codeLanguage } from '../lib/code-languages.mjs';

interface Props { code: string; language: string }

export default function ArticleCodeBlock({ code, language }: Props) {
  const resolved = codeLanguage(language, code);
  return <CodeBlockBase className="article-code-block" data-article-code-block="" data-code-language={resolved}>
    <CodeBlockBase.Code language={resolved}>{code}</CodeBlockBase.Code>
    <div className="article-code-copy">
      <CopyButton copyValue={code} aria-label="复制代码" title="复制代码" variant="ghost" color="secondary" pill={false} size="md" uniform />
    </div>
  </CodeBlockBase>;
}
