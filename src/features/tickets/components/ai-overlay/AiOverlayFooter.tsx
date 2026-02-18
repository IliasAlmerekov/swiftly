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
          Wenn der Assistent nicht weiterhilft, erstellen Sie bitte ein Ticket. So können wir uns
          gezielt um komplexe Fälle kümmern. Vielen Dank für Ihr Verständnis! Ihr ITO-Team.
        </p>
        <Button
          onClick={onCreateTicket}
          variant="secondary"
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          Ticket erstellen
        </Button>
      </div>
    </CardFooter>
  );
});
