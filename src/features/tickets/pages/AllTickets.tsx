import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { TicketStats } from '@/features/tickets/components/TicketStats';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_TICKET_PAGE_SIZE, getAllTickets } from '@/features/tickets/api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuth } from '@/shared/hooks/useAuth';
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

export function AllTickets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';
  const [pageSize, setPageSize] = useState(DEFAULT_TICKET_PAGE_SIZE);

  // fetch all tickets

  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);

  const cursor = useMemo(() => pageCursors[pageIndex] ?? null, [pageCursors, pageIndex]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ticketKeys.list({ scope: 'all', mode: 'page', pageIndex, pageSize, cursor }),
    queryFn: () => getAllTickets({ cursor, limit: pageSize }),
    placeholderData: (previous) => previous,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    retry: 1, // Retry once on failure
    enabled: isStaff,
  });

  const allTickets = data?.items ?? [];
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
    tickets: allTickets,
    searchQuery,
  });

  const handleTicketClick = useCallback(
    (ticketId: string) => navigate(paths.app.ticket.getHref(ticketId, paths.tabs.allTickets)),
    [navigate],
  );

  const handleCreateTicket = useCallback(
    () => navigate(paths.app.dashboard.getHref(paths.tabs.createTicket)),
    [navigate],
  );

  const handleUserClick = useCallback(
    (userId: string) => navigate(paths.app.user.getHref(userId)),
    [navigate],
  );

  const description = useMemo(() => {
    const suffix = searchQuery ? ` for "${searchQuery}"` : '';
    return `${filteredTickets.length} ticket(s) found${suffix}`;
  }, [filteredTickets.length, searchQuery]);

  if (!isStaff) {
    return (
      <div className="space-y-6">
        <div role="alert" className="border-destructive rounded-xl border p-4">
          <p className="font-medium">Access restricted</p>
          <p className="text-sm opacity-80">You do not have permission to view all tickets.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <TicketSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateTicket={handleCreateTicket}
        />
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <TicketSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateTicket={handleCreateTicket}
        />
        <div role="alert" className="border-destructive rounded-xl border p-4">
          <p className="font-medium">Failed to load tickets</p>
          <p className="text-sm opacity-80">{(error as Error)?.message ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <TicketSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateTicket={handleCreateTicket}
      />

      {/* Tickets Table */}
      <TicketTable
        tickets={filteredTickets}
        title="All Tickets"
        description={description}
        onTicketClick={handleTicketClick}
        onUserClick={handleUserClick}
        emptyState={{
          title: searchQuery ? 'No results' : 'No tickets yet',
          description: searchQuery ? 'Try a different query.' : 'Create your first ticket.',
          actionLabel: 'Create Ticket',
          onAction: handleCreateTicket,
        }}
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

      {/* Quick Stats */}
      <TicketStats tickets={allTickets} />
    </div>
  );
}
