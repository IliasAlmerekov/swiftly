import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import type { Ticket } from '@/types';
import { formatCategoryLabel, getInitials } from '@/features/tickets/utils/ticketUtils';

interface TicketDetailsCardProps {
  ticket: Ticket;
}

export const TicketDetailsCard = ({ ticket }: TicketDetailsCardProps) => {
  const formattedCreatedAt = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—';
  const formattedUpdatedAt = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Created</Label>
          <p className="text-sm">{formattedCreatedAt}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Last updated</Label>
          <p className="text-sm">{formattedUpdatedAt}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Requester</Label>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.owner?.avatar?.url} alt={ticket.owner?.name} />
              <AvatarFallback>{getInitials(ticket.owner?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{ticket.owner?.name || 'Unknown'}</p>
              <p className="text-muted-foreground text-xs">{ticket.owner?.email || '—'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Category</Label>
          <p className="text-sm">{formatCategoryLabel(ticket.category)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
