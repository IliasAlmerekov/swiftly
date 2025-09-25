import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { Ticket } from '@/types';
import { getPriorityColor, getStatusColor } from '@/features/tickets/utils/ticketUtils';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import useTicketStatus from '@/shared/hooks/useTicketStatus';

interface TicketRowProps {
  ticket: Ticket;
  onTicketClick?: (ticketId: string) => void;
  onUserClick?: (userId: string) => void;
  role?: string | null;
}

function TicketRow({ ticket, onTicketClick, onUserClick, role }: TicketRowProps) {
  const { className } = useTicketStatus(ticket);

  return (
    <tr className={`hover:bg-muted/50 border-b ${className}`}>
      <td className="p-3 font-mono text-sm">{ticket._id.slice(0, 8)}</td>
      <td className="max-w-xs p-3">
        <a href="" onClick={() => onTicketClick?.(ticket._id)}>
          {ticket.title}
        </a>
      </td>
      <td className="max-w-xs p-3">
        <div className="truncate" title={ticket.owner.name}>
          <Avatar className="mr-2 inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
            <AvatarImage src={ticket.owner.avatar?.url} alt={ticket.owner.name} />
          </Avatar>
          {role === 'admin' ? (
            <span className="font-medium">
              <a href="" onClick={() => onUserClick?.(ticket.owner?._id)}>
                {ticket.owner.name}
              </a>
            </span>
          ) : (
            <span>{ticket.owner.name}</span>
          )}
        </div>
      </td>
      <td className="p-3">
        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
      </td>
      <td className="p-3">
        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
      </td>
      <td className="flex items-center p-3">
        <Avatar className="mr-2 inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
          <AvatarImage
            src={ticket.assignedTo?.avatar?.url}
            alt={ticket.assignedTo?.name || 'Unassigned'}
          />
        </Avatar>
        {ticket.assignedTo?.name ?? 'Unassigned'}
      </td>
      <td className="text-muted-foreground p-3 text-sm">{ticket.createdAt.slice(0, 10)}</td>
    </tr>
  );
}

interface TicketTableProps {
  tickets: Ticket[];
  title?: string;
  description?: string;
  onTicketClick?: (ticketId: string) => void;
  onUserClick?: (_id: string) => void;
  role?: string | null;
}

export function TicketTable({
  tickets,
  title = 'All Tickets',
  description,
  onTicketClick,
  onUserClick,
  role,
}: TicketTableProps) {
  const tableHeaders = [
    { title: 'Ticket ID', key: 'id' },
    { title: 'Title', key: 'title' },
    { title: 'Owner', key: 'owner' },
    { title: 'Priority', key: 'priority' },
    { title: 'Status', key: 'status' },
    { title: 'Assignee', key: 'assignee' },
    { title: 'Created', key: 'created' },
  ];

  const sortedTickets = () => {
    return tickets.sort((a, b) => {
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
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    className="text-md p-3 text-left font-bold text-white uppercase"
                  >
                    {header.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTickets() &&
                tickets.map((ticket, index) => (
                  <TicketRow
                    key={index}
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
