import { memo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { getTickets } from '@/features/tickets';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';
import { TicketRow } from '@/features/tickets/components/TicketRow';
import { TICKET_COLUMNS } from '@/features/tickets/config/ticketColumns';
import { paths } from '@/config/paths';

// --- Container Component: Handles data fetching ---
export default function RecentTickets() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ticketKeys.list({ scope: 'mine', limit: 1 }),
    queryFn: () => getTickets({ scope: 'mine', limit: 1 }),
    staleTime: 30_000,
  });

  const lastTicket = data?.items?.[0] ?? null;

  const handleTicketClick = useCallback(
    (ticketId: string) => {
      navigate(paths.app.ticket.getHref(ticketId));
    },
    [navigate],
  );

  if (isLoading) {
    return <RecentTicketsLoading />;
  }

  if (isError) {
    return <RecentTicketsError />;
  }

  return (
    <RecentTicketsCard>
      {lastTicket ? (
        <TicketRow ticket={lastTicket} onTicketClick={handleTicketClick} />
      ) : (
        <EmptyState />
      )}
    </RecentTicketsCard>
  );
}

// --- Presentational Components ---

interface RecentTicketsCardProps {
  children: React.ReactNode;
}

const RecentTicketsCard = memo(function RecentTicketsCard({ children }: RecentTicketsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {TICKET_COLUMNS.map((column) => (
                  <th key={column.key} className="p-2 text-left font-medium">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <tr>
      <td colSpan={TICKET_COLUMNS.length} className="text-muted-foreground p-4 text-center">
        No tickets found
      </td>
    </tr>
  );
});

const RecentTicketsLoading = memo(function RecentTicketsLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
});

const RecentTicketsError = memo(function RecentTicketsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Failed to load recent tickets</p>
      </CardContent>
    </Card>
  );
});
