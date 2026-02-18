import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { Ticket } from '@/types';
import { TicketIcon } from 'lucide-react';
import {
  getPriorityColor,
  getStatusColor,
  formatCategoryLabel,
} from '@/features/tickets/utils/ticketUtils';

interface TicketHeaderProps {
  ticket: Ticket;
  canEdit: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export const TicketHeader = ({
  ticket,
  canEdit,
  isEditing,
  onEditToggle,
  onBack,
  isSaving = false,
}: TicketHeaderProps) => {
  const priorityLabel = ticket.priority ?? 'untriaged';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <TicketIcon className="text-primary h-4 w-4" />
          Ticket #{ticket._id.substring(0, 8)}
        </div>
        <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${getPriorityColor(priorityLabel)} capitalize`}>
            {priorityLabel} priority
          </Badge>
          <Badge className={`${getStatusColor(ticket.status)} capitalize`}>{ticket.status}</Badge>
          {ticket.category && (
            <Badge variant="outline">{formatCategoryLabel(ticket.category)}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {canEdit && !isEditing && <Button onClick={onEditToggle}>Edit</Button>}
        {isEditing && (
          <>
            <Button type="submit" form="edit-ticket-form" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={onEditToggle} disabled={isSaving}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
