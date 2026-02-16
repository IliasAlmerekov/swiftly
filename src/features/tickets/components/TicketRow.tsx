import { memo } from 'react';

import useTicketStatus from '@/shared/hooks/useTicketStatus';
import type { Ticket, UserRole } from '@/types';
import { TICKET_COLUMNS } from '../config/ticketColumns';

export interface TicketRowProps {
  ticket: Ticket;
  onTicketClick?: (ticketId: string) => void;
  onUserClick?: (userId: string) => void;
  role?: UserRole | null;
}

export const TicketRow = memo(function TicketRow({
  ticket,
  onTicketClick,
  onUserClick,
  role,
}: TicketRowProps) {
  const { className } = useTicketStatus(ticket);

  return (
    <tr className={`hover:bg-muted/50 border-b ${className}`}>
      {TICKET_COLUMNS.map((column) => (
        <td key={column.key} className={column.className}>
          {column.render({ ticket, role, onTicketClick, onUserClick })}
        </td>
      ))}
    </tr>
  );
});

export default TicketRow;
