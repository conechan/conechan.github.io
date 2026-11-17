import { EmptyMessage } from '@openai/apps-sdk-ui/components/EmptyMessage';
import { ButtonLink } from '@openai/apps-sdk-ui/components/Button';

export default function NotFound() {
  return <EmptyMessage className="not-found" fill="none">
    <p className="error-code">404</p>
    <EmptyMessage.Title><h1>这一页没有找到</h1></EmptyMessage.Title>
    <EmptyMessage.Description>链接可能有误，可以回到随笔列表查找文章。</EmptyMessage.Description>
    <EmptyMessage.ActionRow>
      <ButtonLink as="a" href="/" color="secondary" variant="soft" pill={false}>返回</ButtonLink>
    </EmptyMessage.ActionRow>
  </EmptyMessage>;
}
