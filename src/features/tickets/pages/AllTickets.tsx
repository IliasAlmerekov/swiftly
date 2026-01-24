import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { TicketStats } from '@/features/tickets/components/TicketStats';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllTickets } from '@/api/tickets';
import type { Ticket } from '@/types';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuth } from '@/shared/hooks/useAuth';

export function AllTickets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';

  // fetch all tickets

  const {
    data: allTickets = [],
    isLoading,
    isError,
    error,
  } = useQuery<Ticket[]>({
    queryKey: ['all-tickets'],
    queryFn: getAllTickets,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    retry: 1, // Retry once on failure
    enabled: isStaff,
  });

  const filteredTickets = useTicketFilter({
    tickets: allTickets,
    searchQuery,
  });

  const handleTicketClick = useCallback(
    (ticketId: string) => navigate(`/tickets/${ticketId}`),
    [navigate],
  );

  const handleCreateTicket = useCallback(
    () => navigate('/dashboard?tab=create-ticket'),
    [navigate],
  );

  const handleUserClick = useCallback((userId: string) => navigate(`/users/${userId}`), [navigate]);

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

      {/* Quick Stats */}
      <TicketStats tickets={allTickets} />
    </div>
  );
}
