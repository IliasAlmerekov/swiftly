import type { Ticket } from "@/types";
import { TicketTable } from "@/features/tickets/components/TicketTable";
import { TicketSearchBar } from "@/features/tickets/components/TicketSearchBar";
import { TicketStats } from "@/features/tickets/components/TicketStats";
import { useTicketFilter } from "@/shared/hooks/useTicketFilter";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface AllTicketsProps {
  allTickets?: Ticket[];
  searchQuery?: string;
  role?: string | null;
}

export function AllTickets({
  searchQuery = "",
  allTickets = [],
  role,
}: AllTicketsProps) {
  const navigate = useNavigate();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);

  const filteredTickets = useTicketFilter({
    tickets: allTickets,
    searchQuery: currentSearchQuery,
  });

  const handleTicketClick = (ticketId: string): void => {
    navigate(`/tickets/${ticketId}`, { state: { role } });
  };

  const handleCreateTicket = () => {
    navigate("/dashboard?tab=create-ticket");
  };

  const handleUserClick = (userId: string): void => {
    navigate(`/users/${userId}`, { state: { role } });
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
        role={role}
        tickets={filteredTickets}
        title="All Tickets"
        description={`${filteredTickets.length} ticket(s) found${
          currentSearchQuery ? ` for "${currentSearchQuery}"` : ""
        }`}
        onTicketClick={handleTicketClick}
        onUserClick={handleUserClick}
      />

      {/* Quick Stats */}
      <TicketStats tickets={allTickets} />
    </div>
  );
}
