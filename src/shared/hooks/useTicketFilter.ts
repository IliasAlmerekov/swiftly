import { useMemo } from 'react';
import type { Ticket } from '@/types';

export type TicketPredicate = (ticket: Ticket) => boolean;

interface UseTicketFilterOptions {
  tickets: Ticket[];
  searchQuery?: string;
  predicates?: TicketPredicate[];
  searchFields?: Array<(ticket: Ticket) => string | undefined | null>;
}

const defaultSearchFields = [
  (ticket: Ticket) => ticket.title,
  (ticket: Ticket) => ticket._id,
  (ticket: Ticket) => ticket.assignedTo?.name,
  (ticket: Ticket) => ticket.createdBy?.name,
  (ticket: Ticket) => ticket.category,
  (ticket: Ticket) => ticket.owner?.name,
];

export function useTicketFilter({
  tickets,
  searchQuery = '',
  predicates = [],
  searchFields = defaultSearchFields,
}: UseTicketFilterOptions) {
  const filteredList = useMemo(() => {
    let filtered = tickets;

    if (predicates.length > 0) {
      filtered = filtered.filter((ticket) => predicates.every((predicate) => predicate(ticket)));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ticket) =>
        searchFields.some((field) => field(ticket)?.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [tickets, searchQuery, predicates, searchFields]);

  return filteredList;
}
