import { useNavigate } from 'react-router-dom';
import { TicketTable } from '@/features/tickets/components/TicketTable';
import { TicketSearchBar } from '@/features/tickets/components/TicketSearchBar';
import { useTicketFilter } from '@/shared/hooks/useTicketFilter';
import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserTickets } from '@/api/tickets';

interface MyTicketsProps {
  userId?: string;
}

export function MyTickets({ userId }: MyTicketsProps) {
  const [searchQuery] = useState('');
  const navigate = useNavigate();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const { role } = useAuth();

  // fetch user's tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-tickets', userId],
    queryFn: getUserTickets,
  });

  const filteredTickets = useTicketFilter({
    tickets,
    searchQuery: currentSearchQuery,
    filterMyTickets: true,
    userId,
  });

  const handleTicketClick = (ticketId: string): void => {
    navigate(`/tickets/${ticketId}`, { state: { role } });
  };

  const handleCreateTicket = () => {
    navigate('/dashboard?tab=create-ticket');
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
    </div>
  );
}
