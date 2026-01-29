import { memo } from 'react';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/lib/utils';
import type { ChatRequest } from '@/types';

// ============ Message Formatter ============
const formatAIMessage = (content: string) => {
  if (!content.includes('1.') && !content.includes('2.')) {
    return <span>{content}</span>;
  }

  const beforeList = content.split(/\d+\./)[0].trim();
  const listMatches = content.match(/\d+\.\s+[^.]+\./g) || [];
  const listItems = listMatches.map((item) =>
    item
      .replace(/^\d+\.\s+/, '')
      .replace(/\.$/, '')
      .trim(),
  );
  const lastMatch = listMatches[listMatches.length - 1];
  const afterList = lastMatch ? content.split(lastMatch)[1]?.trim() : '';

  return (
    <div>
      {beforeList && <span>{beforeList} </span>}
      {listItems.length > 0 && (
        <ol className="my-2 list-inside list-decimal space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      )}
      {afterList && <span>{afterList}</span>}
    </div>
  );
};

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
  const timeLabel = new Date(message.timestamp).toLocaleTimeString('de-DE', {
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
          {message.role === 'assistant' ? formatAIMessage(message.content || '') : message.content}
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
          <AvatarFallback className="bg-muted text-muted-foreground">DU</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
