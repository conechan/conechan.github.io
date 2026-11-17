import { TextLink } from '@openai/apps-sdk-ui/components/TextLink';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href }: { href: string }) {
  return <TextLink as="a" href={href} className="back-link" underline={false}>
    <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />返回
  </TextLink>;
}

export function BackToTopLink() {
  return <TextLink as="a" href="#top" data-back-top="" underline={false}>回到顶部</TextLink>;
}

export function AdjacentPostLink({ href, label, title }: { href: string; label: string; title: string }) {
  return <TextLink as="a" href={href} className="adjacent-post-link" underline={false}>
    <span className="adjacent-post-label">{label}</span><span>{title}</span>
  </TextLink>;
}
