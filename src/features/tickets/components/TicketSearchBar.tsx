import { memo, useState, useEffect, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface TicketSearchBarProps {
  /** Initial search query value */
  initialValue?: string;
  /** Callback fired with debounced search value */
  onSearch: (query: string) => void;
  onCreateTicket?: () => void;
  placeholder?: string;
  showCreateButton?: boolean;
  filters?: ReactNode;
  actions?: ReactNode;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

/**
 * Ticket search bar with isolated local state.
 *
 * Follows bulletproof-react patterns:
 * - Local state isolation prevents parent re-renders on every keystroke
 * - Debounced value is lifted to parent only when typing stops
 * - memo() prevents unnecessary re-renders from parent
 */
export const TicketSearchBar = memo(function TicketSearchBar({
  initialValue = '',
  onSearch,
  onCreateTicket,
  placeholder = 'Search tickets...',
  showCreateButton = true,
  filters,
  actions,
  debounceMs = 300,
}: TicketSearchBarProps) {
  // Local state - typing updates this immediately without parent re-renders
  const [localQuery, setLocalQuery] = useState(initialValue);

  // Debounced value - lifted to parent only after debounce delay
  const debouncedQuery = useDebounce(localQuery, debounceMs);

  // Lift debounced value to parent
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Sync with external initialValue changes (e.g., URL params)
  useEffect(() => {
    setLocalQuery(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={localQuery}
          onChange={handleChange}
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
