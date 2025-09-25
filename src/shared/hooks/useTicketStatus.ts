import type { Ticket } from "@/types";

export function useTicketStatus(ticket: Ticket) {
  const isActive = !ticket.assignedTo;

  return {
    isActive,
    isAssigned: !!ticket.assignedTo,
    className: isActive ? "opacity-100 font-bold text-sm" : "opacity-80 text-muted-foreground text-sm",
  };
}

export default useTicketStatus;
