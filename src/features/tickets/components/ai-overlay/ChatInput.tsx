import { memo, useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

/**
 * Chat input component with isolated local state.
 *
 * The input value state is kept inside this component,
 * preventing parent re-renders on every keystroke.
 * Only the final message is lifted to parent via onSendMessage.
 */
export const ChatInput = memo(function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isLoading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex w-full gap-3">
      <Textarea
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Beschreiben Sie Ihr Problem in 1-2 Sätzen..."
        className="min-h-[56px] flex-1"
        disabled={isLoading}
        rows={2}
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !inputValue.trim()}
        className="h-auto min-w-[52px] px-4"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
});
