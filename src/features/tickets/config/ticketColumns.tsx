import { Badge } from '@/shared/components/ui/badge';
import { getPriorityColor, getStatusColor } from '@/features/tickets/utils/ticketUtils';
import { UserCell } from '../components/UserCell';
import type { TicketTableColumn } from '../constants/ticketTable';

// Column definitions with render functions
export const TICKET_COLUMNS: TicketTableColumn[] = [
  {
    key: 'id',
    title: 'Ticket ID',
    className: 'p-3 font-mono text-sm',
    render: ({ ticket }) => ticket._id.slice(0, 8),
  },
  {
    key: 'title',
    title: 'Title',
    className: 'max-w-xs p-3',
    render: ({ ticket, onTicketClick }) =>
      onTicketClick ? (
        <button
          onClick={() => onTicketClick(ticket._id)}
          className="cursor-pointer text-left font-medium hover:underline"
        >
          {ticket.title}
        </button>
      ) : (
        <span className="font-medium">{ticket.title}</span>
      ),
  },
  {
    key: 'owner',
    title: 'Owner',
    className: 'max-w-xs p-3',
    render: ({ ticket, role, onUserClick }) => {
      const ownerName = ticket.owner?.name ?? 'Unknown User';
      const ownerId = ticket.owner?._id;
      const ownerAvatarUrl = ticket.owner?.avatar?.url;
      const isClickable = role === 'admin' && !!ownerId;

      return (
        <UserCell
          name={ownerName}
          avatarUrl={ownerAvatarUrl}
          userId={ownerId}
          isClickable={isClickable}
          onUserClick={onUserClick}
        />
      );
    },
  },
  {
    key: 'priority',
    title: 'Priority',
    className: 'p-3',
    render: ({ ticket }) => {
      const priorityLabel = ticket.priority ?? 'untriaged';
      return <Badge className={getPriorityColor(priorityLabel)}>{priorityLabel}</Badge>;
    },
  },
  {
    key: 'status',
    title: 'Status',
    className: 'p-3',
    render: ({ ticket }) => (
      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
    ),
  },
  {
    key: 'assignee',
    title: 'Assignee',
    className: 'p-3',
    render: ({ ticket, role, onUserClick }) => {
      const assigneeName = ticket.assignedTo?.name ?? 'Unassigned';
      const assigneeId = ticket.assignedTo?._id;
      const assigneeAvatarUrl = ticket.assignedTo?.avatar?.url;
      const isClickable = (role === 'admin' || role === 'support1') && !!assigneeId;

      return (
        <UserCell
          name={assigneeName}
          avatarUrl={assigneeAvatarUrl}
          userId={assigneeId}
          isClickable={isClickable}
          onUserClick={onUserClick}
        />
      );
    },
  },
  {
    key: 'created',
    title: 'Created',
    className: 'text-muted-foreground p-3 text-sm',
    render: ({ ticket }) => ticket.createdAt.slice(0, 10),
  },
];
