import { memo } from 'react';
import { Bot, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface AiOverlayHeaderProps {
  onClose: () => void;
}

/**
 * AI Overlay header component.
 * Static content with close button.
 */
export const AiOverlayHeader = memo(function AiOverlayHeader({ onClose }: AiOverlayHeaderProps) {
  return (
    <CardHeader className="relative flex-row items-start justify-between gap-4 space-y-0">
      <div className="flex items-center gap-4">
        <Avatar className="size-11 border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">AI Helpdesk Assistant</CardTitle>
          <CardDescription>
            Instant help for common issues before creating a ticket.
          </CardDescription>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">ITO Support</Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4"
      >
        <X className="size-4" />
      </Button>
    </CardHeader>
  );
});
