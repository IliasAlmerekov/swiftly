import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import type { User } from '@/types';
import { getInitials } from '@/features/tickets/utils/ticketUtils';

interface TicketRequesterCardProps {
  owner?: User;
}

export const TicketRequesterCard = ({ owner }: TicketRequesterCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requester</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={owner?.avatar?.url} alt={owner?.name} />
          <AvatarFallback>{getInitials(owner?.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{owner?.name || 'Unknown'}</p>
          <p className="text-muted-foreground text-xs">{owner?.position || '—'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
