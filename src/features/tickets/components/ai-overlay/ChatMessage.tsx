import { memo, useMemo } from 'react';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { sanitizeUserGeneratedRichText } from '@/shared/lib/security/sanitizeRichText';
import type { ChatRequest } from '@/types';

// ============ Types ============
interface ChatMessageProps {
  message: ChatRequest;
}

// ============ Component ============
/**
 * Single chat message component.
 * Memoized to prevent re-renders when other messages change.
 */
export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const messageContent = message.content || '';
  const richTextHtml = useMemo(
    () => sanitizeUserGeneratedRichText(messageContent, isUser ? 'plain' : 'markdown'),
    [isUser, messageContent],
  );
  const timeLabel = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="mt-1 size-8 border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-background text-foreground rounded-bl-sm border',
        )}
      >
        <div className="text-sm leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: richTextHtml }} />
        </div>
        <div
          className={cn(
            'mt-2 text-xs',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {timeLabel}
        </div>
      </div>
      {isUser && (
        <Avatar className="mt-1 size-8 border">
          <AvatarFallback className="bg-muted text-muted-foreground">YOU</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
