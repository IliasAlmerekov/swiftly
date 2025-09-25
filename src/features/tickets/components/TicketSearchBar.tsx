import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { IconSearch, IconPlus } from "@tabler/icons-react";

interface TicketSearchBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateTicket?: () => void;
  placeholder?: string;
  showCreateButton?: boolean;
}

export function TicketSearchBar({
  searchQuery = "",
  onSearchChange,
  onCreateTicket,
  placeholder = "Search tickets...",
  showCreateButton = true,
}: TicketSearchBarProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          defaultValue={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      {showCreateButton && (
        <Button onClick={onCreateTicket}>
          <IconPlus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      )}
    </div>
  );
}
