import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import type { Comment } from '@/types';
import { getInitials } from '@/features/tickets/utils/ticketUtils';
import konto from '@/assets/konto.png';

interface TicketCommentsProps {
  comments: Comment[];
}

export const TicketComments = ({ comments }: TicketCommentsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((entry) => (
              <div key={entry._id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={entry.author?.avatar?.url || konto}
                        alt={entry.author?.name}
                      />
                      <AvatarFallback>
                        {getInitials(entry.author?.name || entry.author?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {entry.author?.name || entry.author?.email || 'Unknown'}
                      </p>
                      <p className="text-muted-foreground text-xs">{entry.author?.email || '—'}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <Separator className="my-3" />
                <p className="text-sm">{entry.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
