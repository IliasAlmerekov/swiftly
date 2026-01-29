import { memo, type RefObject } from 'react';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ChatMessage } from './ChatMessage';
import type { ChatRequest } from '@/types';

interface ChatMessageListProps {
  messages: ChatRequest[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

// ============ Loading Indicator ============
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="mt-1 size-8 border">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="size-5" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-background rounded-2xl rounded-bl-sm border px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
          <span
            className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: '0.1s' }}
          />
          <span
            className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
});

// ============ Main Component ============
/**
 * Chat message list component.
 * Renders the list of messages with auto-scroll anchor.
 */
export const ChatMessageList = memo(function ChatMessageList({
  messages,
  isLoading,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
    <div className="bg-muted/20 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border p-4">
      <div className="flex-1 space-y-5 overflow-y-auto pr-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});
