import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';
import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_TICKET_PAGE_SIZE, getUserTickets } from '@/features/tickets/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';

interface MyTicketsProps {
  userId?: string;
}

export function MyTickets({ userId }: MyTicketsProps) {
  const [searchQuery] = useState('');
  const navigate = useNavigate();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const { role } = useAuth();
  const [pageSize, setPageSize] = useState(DEFAULT_TICKET_PAGE_SIZE);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);

  const cursor = useMemo(() => pageCursors[pageIndex] ?? null, [pageCursors, pageIndex]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...ticketKeys.userTickets(), userId, 'page', pageIndex, pageSize, cursor],
    queryFn: () => getUserTickets({ cursor, limit: pageSize }),
    placeholderData: (previous) => previous,
  });

  const tickets = data?.items ?? [];
  const pageInfo = data?.pageInfo;
  const hasNextPage = Boolean(pageInfo?.hasNextPage);
  const hasPreviousPage = pageIndex > 0;
  const isPrevDisabled = !hasPreviousPage || isFetching;
  const isNextDisabled = !hasNextPage || isFetching;

  useEffect(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, [pageSize]);

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={isPrevDisabled}
                tabIndex={isPrevDisabled ? -1 : 0}
                className={isPrevDisabled ? 'pointer-events-none opacity-50' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (isPrevDisabled) return;
                  setPageIndex((prev) => Math.max(0, prev - 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                size="default"
                className="pointer-events-none"
                onClick={(event) => event.preventDefault()}
              >
                {pageIndex + 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={isNextDisabled}
                tabIndex={isNextDisabled ? -1 : 0}
                className={isNextDisabled ? 'pointer-events-none opacity-50' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (isNextDisabled || !pageInfo?.nextCursor) return;
                  setPageCursors((prev) => {
                    const next = [...prev];
                    if (!next[pageIndex + 1]) {
                      next[pageIndex + 1] = pageInfo.nextCursor;
                    }
                    return next;
                  });
                  setPageIndex((prev) => prev + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span className="text-muted-foreground text-sm">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
