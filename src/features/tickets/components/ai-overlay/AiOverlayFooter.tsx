import { memo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { CardFooter } from '@/shared/components/ui/card';
import { ChatInput } from './ChatInput';

interface AiOverlayFooterProps {
  onSendMessage: (content: string) => void;
  onCreateTicket: () => void;
  isLoading: boolean;
}

/**
 * AI Overlay footer component.
 * Contains chat input and create ticket button.
 */
export const AiOverlayFooter = memo(function AiOverlayFooter({
  onSendMessage,
  onCreateTicket,
  isLoading,
}: AiOverlayFooterProps) {
  return (
    <CardFooter className="flex-col gap-4 px-4 py-4">
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      <div className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm sm:max-w-[70%]">
          If the assistant cannot resolve your issue, please create a ticket. This helps us handle
          complex cases more effectively. Thank you for your understanding. Your ITO Team.
        </p>
        <Button
          onClick={onCreateTicket}
          variant="secondary"
          className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto sm:min-w-[200px]"
        >
          Create ticket
        </Button>
      </div>
    </CardFooter>
  );
});
