import { memo, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { IconSearch, IconPlus } from '@tabler/icons-react';

interface TicketSearchBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateTicket?: () => void;
  placeholder?: string;
  showCreateButton?: boolean;
  filters?: ReactNode;
  actions?: ReactNode;
}

export const TicketSearchBar = memo(function TicketSearchBar({
  searchQuery = '',
  onSearchChange,
  onCreateTicket,
  placeholder = 'Search tickets...',
  showCreateButton = true,
  filters,
  actions,
}: TicketSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {filters}
        {showCreateButton && (
          <Button onClick={onCreateTicket}>
            <IconPlus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
});
