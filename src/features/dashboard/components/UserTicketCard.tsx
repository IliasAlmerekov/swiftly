import { useQuery } from '@tanstack/react-query';
import { getUserTickets, type TicketListResponse } from '@/features/tickets/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { IconTicket, IconUsers, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';
import type { Ticket } from '@/types';

interface UserTicketCardProps {
  title: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export default function UserTicketCard() {
  // Fetch user tickets data
  const { data: userTickets } = useQuery({
    queryKey: [...ticketKeys.userTickets(), 'summary'],
    queryFn: () => getUserTickets(),
    select: (ticketPage: TicketListResponse) => {
      const tickets = ticketPage?.items ?? [];

      return {
        totalTickets: tickets.length ?? 0,
        openTickets: tickets.filter((ticket: Ticket) => ticket.status === 'open').length ?? 0,
        inProgressTickets:
          tickets.filter((ticket: Ticket) => ticket.status === 'in-progress').length ?? 0,
        resolvedTickets:
          tickets.filter(
            (ticket: Ticket) => ticket.status === 'resolved' || ticket.status === 'closed',
          ).length ?? 0,
      };
    },
  });

  // Simple metrics data
  const metricsData: UserTicketCardProps[] = [
    {
      title: 'Total Tickets',
      value: userTickets?.totalTickets ?? 0,
      icon: IconTicket,
      description: 'All time tickets',
    },
    {
      title: 'Open Tickets',
      value: userTickets?.openTickets ?? 0,
      icon: IconClock,
      description: 'Currently open',
    },
    {
      title: 'In progress Tickets',
      value: userTickets?.inProgressTickets ?? 0,
      icon: IconUsers,

      description: 'Being worked on',
    },
    {
      title: 'Resolved Tickets',
      value: userTickets?.resolvedTickets ?? 0,
      icon: IconCircleCheck,
      description: 'Resolved or closed',
    },
  ];

  return (
    <>
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title ?? 'Tickets'}</CardTitle>
            <metric.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value ?? 0}</div>
            <div className="text-muted-foreground flex items-center space-x-2 text-xs">
              <span>{metric.description ?? ''}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
