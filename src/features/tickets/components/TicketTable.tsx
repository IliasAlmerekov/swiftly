import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { Ticket } from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { TicketRow } from './TicketRow';
import { TICKET_COLUMNS } from '../config/ticketColumns';

interface TicketTableProps {
  tickets: Ticket[];
  title?: string;
  description?: string;
  onTicketClick?: (ticketId: string) => void;
  onUserClick?: (_id: string) => void;
  emptyState?: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

export function TicketTable({
  tickets,
  title = 'Tickets',
  description,
  onTicketClick,
  onUserClick,
}: TicketTableProps) {
  const { role } = useAuth();

  const sortedTickets = () => {
    return [...tickets].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {TICKET_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="text-md p-3 text-left font-bold text-white uppercase"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTickets().map((ticket) => (
                <TicketRow
                  key={ticket._id}
                  ticket={ticket}
                  onTicketClick={onTicketClick}
                  onUserClick={onUserClick}
                  role={role}
                />
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            No tickets found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
