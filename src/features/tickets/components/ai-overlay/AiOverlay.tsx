import { memo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { useAiChat } from './useAiChat';
import { AiOverlayHeader } from './AiOverlayHeader';
import { AiOverlayFooter } from './AiOverlayFooter';
import { ChatMessageList } from './ChatMessageList';

interface AiOverlayProps {
  isOpen: boolean;
  onAllowCreateTicket: () => void;
  onNavigate: () => void;
}

/**
 * AI Assistant overlay component.
 *
 * Follows bulletproof-react patterns:
 * - Separated into small, focused sub-components
 * - Chat logic extracted to useAiChat hook
 * - ChatInput isolates input state (no parent re-renders on typing)
 * - Each sub-component is memoized
 */
export const AiOverlay = memo(function AiOverlay({
  isOpen,
  onAllowCreateTicket,
  onNavigate,
}: AiOverlayProps) {
  const { messages, isLoading, messagesEndRef, sendMessage } = useAiChat({ isOpen });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="flex h-[75vh] min-h-[640px] w-full max-w-5xl flex-col overflow-hidden shadow-2xl">
        <AiOverlayHeader onClose={onNavigate} />
        <Separator />
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
        </CardContent>
        <Separator />
        <AiOverlayFooter
          onSendMessage={sendMessage}
          onCreateTicket={onAllowCreateTicket}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
});

export default AiOverlay;
