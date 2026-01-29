import { useCallback, useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { TicketStats } from '@/features/tickets/components/TicketStats';
import { DEFAULT_TICKET_PAGE_SIZE, getTickets } from '@/features/tickets/api';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';
import {
  useTicketFilters,
  STAFF_TABS,
  USER_STATUS_SELECT_OPTIONS,
} from '@/features/tickets/hooks/useTicketFilters';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePagination } from '@/shared/hooks/usePagination';
import FilterSelect from '@/shared/components/filters/FilterSelect';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { PageSizeSelector } from '@/shared/components/ui/page-size-selector';

// ============ Loading State Component ============
interface TicketsLoadingProps {
  onSearch: (query: string) => void;
  onCreateTicket: () => void;
}

const TicketsLoading = memo(function TicketsLoading({
  onSearch,
  onCreateTicket,
}: TicketsLoadingProps) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <TicketSearchBar onSearch={onSearch} onCreateTicket={onCreateTicket} />
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </div>
  );
});

// ============ Error State Component ============
interface TicketsErrorProps {
  error: Error | null;
  onSearch: (query: string) => void;
  onCreateTicket: () => void;
}

const TicketsError = memo(function TicketsError({
  error,
  onSearch,
  onCreateTicket,
}: TicketsErrorProps) {
  return (
    <div className="space-y-6">
      <TicketSearchBar onSearch={onSearch} onCreateTicket={onCreateTicket} />
      <div role="alert" className="border-destructive rounded-xl border p-4">
        <p className="font-medium">Failed to load tickets</p>
        <p className="text-sm opacity-80">{error?.message ?? 'Unknown error'}</p>
      </div>
    </div>
  );
});

// ============ Pagination Footer Component ============
interface PaginationFooterProps {
  pageIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  pageSize: number;
  nextCursor: string | null;
  onPreviousPage: () => void;
  onNextPage: (cursor: string | null) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationFooter = memo(function PaginationFooter({
  pageIndex,
  hasPreviousPage,
  hasNextPage,
  isFetching,
  pageSize,
  nextCursor,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
}: PaginationFooterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <PaginationControls
        pageIndex={pageIndex}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        isDisabled={isFetching}
        onPreviousPage={onPreviousPage}
        onNextPage={() => onNextPage(nextCursor)}
      />
      <PageSizeSelector pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
    </div>
  );
});

// ============ Main Component ============
/**
 * Tickets page component.
 *
 * Follows bulletproof-react patterns:
 * - Custom hooks for filters and pagination
 * - Memoized sub-components for state isolation
 * - Separation of concerns: data fetching, presentation, navigation
 */
export function Tickets() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';

  // Search state - debounced value from TicketSearchBar
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized search handler to prevent TicketSearchBar re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter state from custom hook
  const { activeFilterValue, activeStaffTab, queryFilters, filterKey, onFilterChange } =
    useTicketFilters({ isStaff });

  // Pagination state from custom hook
  const {
    pageIndex,
    pageSize,
    cursor,
    hasPreviousPage,
    setPageSize,
    goToPreviousPage,
    goToNextPage,
  } = usePagination({
    initialPageSize: DEFAULT_TICKET_PAGE_SIZE,
    resetKey: filterKey,
  });

  // Data fetching
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ticketKeys.list({
      scope: queryFilters.scope,
      status: queryFilters.status?.join(',') ?? 'all',
      date: queryFilters.date ?? 'any',
      includeUnassigned: Boolean(queryFilters.includeUnassigned),
      pageIndex,
      pageSize,
      cursor,
    }),
    queryFn: () =>
      getTickets({
        scope: queryFilters.scope,
        status: queryFilters.status,
        date: queryFilters.date,
        includeUnassigned: queryFilters.includeUnassigned,
        cursor,
        limit: pageSize,
      }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const tickets = data?.items ?? [];
  const pageInfo = data?.pageInfo;
  const hasNextPage = Boolean(pageInfo?.hasNextPage);

  // Client-side search filtering
  const filteredTickets = useTicketFilter({
    tickets,
    searchQuery,
  });

  // ============ Navigation Handlers ============
  const handleTicketClick = useCallback(
    (ticketId: string) => navigate(paths.app.ticket.getHref(ticketId, paths.tabs.tickets)),
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

  // ============ Computed Values ============
  const description = useMemo(() => {
    const suffix = searchQuery ? ` for "${searchQuery}"` : '';
    return `${filteredTickets.length} ticket(s) found${suffix}`;
  }, [filteredTickets.length, searchQuery]);

  const showStats = isStaff && activeStaffTab.value === 'all';

  // ============ Render States ============
  if (isLoading) {
    return <TicketsLoading onSearch={handleSearch} onCreateTicket={handleCreateTicket} />;
  }

  if (isError) {
    return (
      <TicketsError
        error={error as Error | null}
        onSearch={handleSearch}
        onCreateTicket={handleCreateTicket}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TicketSearchBar
        onSearch={handleSearch}
        onCreateTicket={handleCreateTicket}
        filters={
          <FilterSelect
            value={isStaff ? activeStaffTab.value : activeFilterValue}
            onValueChange={onFilterChange}
            options={
              isStaff
                ? STAFF_TABS.map((tab) => ({ value: tab.value, label: tab.label }))
                : USER_STATUS_SELECT_OPTIONS
            }
            placeholder="Filter tickets"
            ariaLabel="Ticket filter"
            className="h-10 w-full sm:w-[200px]"
          />
        }
      />

      <TicketTable
        tickets={filteredTickets}
        title="Tickets"
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

      <PaginationFooter
        pageIndex={pageIndex}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
        pageSize={pageSize}
        nextCursor={pageInfo?.nextCursor ?? null}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onPageSizeChange={setPageSize}
      />

      {showStats && <TicketStats tickets={tickets} />}
    </div>
  );
}
