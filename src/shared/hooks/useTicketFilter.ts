import { useMemo } from 'react';
import type { Ticket } from '@/types';

interface UseTicketFilterOptions {
  tickets: Ticket[];
  searchQuery: string;
  filterMyTickets?: boolean;
  userId?: string;
}

export function useTicketFilter({
  tickets,
  searchQuery,
  filterMyTickets = false,
  userId,
}: UseTicketFilterOptions) {
  const filteredList = useMemo(() => {
    let filtered = tickets;

    // Filter by user's tickets if needed
    if (filterMyTickets && userId) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.createdBy?._id === userId ||
          ticket.owner?._id === userId ||
          ticket.assignedTo?._id === userId,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(query) ||
          ticket._id?.toLowerCase().includes(query) ||
          ticket.assignedTo?.name?.toLowerCase().includes(query) ||
          ticket.createdBy?.name?.toLowerCase().includes(query) ||
          ticket.category?.toLowerCase().includes(query) ||
          ticket.owner?.name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [tickets, searchQuery, filterMyTickets, userId]);

  return filteredList;
}
