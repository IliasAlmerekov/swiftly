import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';
import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useMemo, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_TICKET_PAGE_SIZE, getUserTickets } from '@/features/tickets/api';
import { Button } from '@/shared/components/ui/button';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';

interface MyTicketsProps {
  userId?: string;
}

export function MyTickets({ userId }: MyTicketsProps) {
  const [searchQuery] = useState('');
  const navigate = useNavigate();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const { role } = useAuth();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);

  const cursor = useMemo(() => pageCursors[pageIndex] ?? null, [pageCursors, pageIndex]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...ticketKeys.userTickets(), userId, 'page', pageIndex, cursor],
    queryFn: () => getUserTickets({ cursor, limit: DEFAULT_TICKET_PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });

  const tickets = data?.items ?? [];
  const pageInfo = data?.pageInfo;
  const hasNextPage = Boolean(pageInfo?.hasNextPage);
  const hasPreviousPage = pageIndex > 0;

  const filteredTickets = useTicketFilter({
    tickets,
    searchQuery: currentSearchQuery,
    filterMyTickets: true,
    userId,
  });

  const handleTicketClick = (ticketId: string): void => {
    navigate(paths.app.ticket.getHref(ticketId, paths.tabs.myTickets), { state: { role } });
  };

  const handleCreateTicket = () => {
    navigate(paths.app.dashboard.getHref(paths.tabs.createTicket));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <TicketSearchBar
        searchQuery={currentSearchQuery}
        onSearchChange={setCurrentSearchQuery}
        onCreateTicket={handleCreateTicket}
      />

      {/* Tickets Table */}
      <TicketTable
        tickets={filteredTickets}
        title="My Tickets"
        description={`${filteredTickets.length} ticket(s) found${
          currentSearchQuery ? ` for "${currentSearchQuery}"` : ''
        }`}
        onTicketClick={handleTicketClick}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm">Page {pageIndex + 1}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={!hasPreviousPage || isFetching}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (!pageInfo?.nextCursor) return;
              setPageCursors((prev) => {
                const next = [...prev];
                if (!next[pageIndex + 1]) {
                  next[pageIndex + 1] = pageInfo.nextCursor;
                }
                return next;
              });
              setPageIndex((prev) => prev + 1);
            }}
            disabled={!hasNextPage || isFetching}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
