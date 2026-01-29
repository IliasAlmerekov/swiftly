import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { TicketStats } from '@/features/tickets/components/TicketStats';
import {
  DEFAULT_TICKET_PAGE_SIZE,
  getTickets,
  type TicketDateFilter,
  type TicketScope,
} from '@/features/tickets/api';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useAuth } from '@/shared/hooks/useAuth';
import FilterSelect from '@/shared/components/filters/FilterSelect';
import { Skeleton } from '@/shared/components/ui/skeleton';
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

const USER_STATUS_OPTIONS = [
  { value: 'all', label: 'All tickets', status: undefined },
  { value: 'open', label: 'Open', status: ['open'] },
  { value: 'in-progress', label: 'In progress', status: ['in-progress'] },
  { value: 'closed', label: 'Closed', status: ['closed', 'resolved'] },
];

const USER_STATUS_SELECT_OPTIONS = USER_STATUS_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

interface StaffTab {
  value: string;
  label: string;
  scope: TicketScope;
  status?: string[];
  date?: TicketDateFilter;
  includeUnassigned?: boolean;
}

const STAFF_TABS: StaffTab[] = [
  {
    value: 'assigned',
    label: 'My in progress',
    scope: 'assignedToMe',
    includeUnassigned: true,
  },
  { value: 'all', label: 'All tickets', scope: 'all' },
  { value: 'open', label: 'All open', scope: 'all', status: ['open'] },
  { value: 'in-progress', label: 'All in progress', scope: 'all', status: ['in-progress'] },
  { value: 'today', label: "Today's tickets", scope: 'all', date: 'today' },
  { value: 'closed', label: 'Closed', scope: 'all', status: ['closed', 'resolved'] },
];

export function Tickets() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_TICKET_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);

  const resolveFilterValue = useCallback((value: string | null, staffMode: boolean): string => {
    if (staffMode) {
      return value !== null && STAFF_TABS.some((tab) => tab.value === value)
        ? value
        : STAFF_TABS[1].value;
    }
    return value !== null && USER_STATUS_OPTIONS.some((option) => option.value === value)
      ? value
      : USER_STATUS_OPTIONS[0].value;
  }, []);

  const activeFilterValue = useMemo(
    () => resolveFilterValue(searchParams.get('filter'), isStaff),
    [isStaff, resolveFilterValue, searchParams],
  );

  const activeTabValue = useMemo(
    () => resolveFilterValue(searchParams.get('filter'), true),
    [resolveFilterValue, searchParams],
  );

  useEffect(() => {
    const current = searchParams.get('filter');
    if (current === activeFilterValue) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filter', activeFilterValue);
    setSearchParams(nextParams, { replace: true });
  }, [activeFilterValue, searchParams, setSearchParams]);

  const cursor = useMemo(() => pageCursors[pageIndex] ?? null, [pageCursors, pageIndex]);

  const activeStaffTab = useMemo(
    () => STAFF_TABS.find((tab) => tab.value === activeTabValue) ?? STAFF_TABS[1],
    [activeTabValue],
  );

  const activeUserFilter = useMemo(
    () =>
      USER_STATUS_OPTIONS.find((option) => option.value === activeFilterValue) ??
      USER_STATUS_OPTIONS[0],
    [activeFilterValue],
  );

  const queryFilters = useMemo((): {
    scope: TicketScope;
    status?: string[];
    date?: TicketDateFilter;
    includeUnassigned?: boolean;
  } => {
    if (isStaff) {
      return {
        scope: activeStaffTab.scope,
        status: activeStaffTab.status,
        date: activeStaffTab.date,
        includeUnassigned: activeStaffTab.includeUnassigned,
      };
    }
    return {
      scope: 'mine',
      status: activeUserFilter.status,
    };
  }, [activeStaffTab, activeUserFilter, isStaff]);

  const filterKey = useMemo(() => {
    const statusKey = queryFilters.status ? queryFilters.status.join(',') : 'all';
    return `${queryFilters.scope}-${statusKey}-${queryFilters.date ?? 'any'}-${
      queryFilters.includeUnassigned ? 'with-unassigned' : 'assigned-only'
    }`;
  }, [queryFilters]);

  useEffect(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, [pageSize, filterKey]);

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
  const hasPreviousPage = pageIndex > 0;
  const isPrevDisabled = !hasPreviousPage || isFetching;
  const isNextDisabled = !hasNextPage || isFetching;

  const filteredTickets = useTicketFilter({
    tickets,
    searchQuery,
  });

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

  const description = useMemo(() => {
    const suffix = searchQuery ? ` for "${searchQuery}"` : '';
    return `${filteredTickets.length} ticket(s) found${suffix}`;
  }, [filteredTickets.length, searchQuery]);

  const showStats = isStaff && activeStaffTab.value === 'all';

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
      <TicketSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateTicket={handleCreateTicket}
        filters={
          <FilterSelect
            value={isStaff ? activeTabValue : activeFilterValue}
            onValueChange={(value) => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('filter', value);
              setSearchParams(nextParams);
            }}
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

      {showStats && <TicketStats tickets={tickets} />}
    </div>
  );
}
