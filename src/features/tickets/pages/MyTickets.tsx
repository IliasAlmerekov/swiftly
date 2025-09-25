import type { Ticket } from "@/types";
import { useNavigate } from "react-router-dom";
import { TicketTable } from "@/features/tickets/components/TicketTable";
import { TicketSearchBar } from "@/features/tickets/components/TicketSearchBar";
import { useTicketFilter } from "@/shared/hooks/useTicketFilter";
import { useState } from "react";

interface MyTicketsProps {
  searchQuery?: string;
  tickets?: Ticket[];
  role?: string | null;
  userId?: string;
}

export function MyTickets({
  searchQuery = "",
  tickets = [],
  role,
  userId,
}: MyTicketsProps) {
  const navigate = useNavigate();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);

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
    navigate("/dashboard?tab=create-ticket");
  };

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
          currentSearchQuery ? ` for "${currentSearchQuery}"` : ""
        }`}
        onTicketClick={handleTicketClick}
      />
    </div>
  );
}
