import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Ticket } from '@/types';
import { IconTicket, IconCircleCheck, IconClock } from '@tabler/icons-react';
import {
  TotalTicketsChart,
  OpenTicketsChart,
  InProgressChart,
  ResolvedChart,
} from './charts/TicketStatusChart';

interface AdminTicketCardProps {
  title: string;
  icon: typeof IconTicket;
  component: React.ComponentType<{ allTickets?: Ticket[] }>;
}

export default function AdminTicketCard() {
  // Admin charts configuration
  const adminChartsData: AdminTicketCardProps[] = [
    {
      title: 'Total Tickets',
      icon: IconTicket,
      component: TotalTicketsChart,
    },
    {
      title: 'Open Tickets',
      icon: IconClock,
      component: OpenTicketsChart,
    },
    {
      title: 'In Progress Tickets',
      icon: IconClock,
      component: InProgressChart,
    },
    {
      title: 'Resolved Tickets',
      icon: IconCircleCheck,
      component: ResolvedChart,
    },
  ];
  return (
    <>
      {adminChartsData.map((chart, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
            <chart.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <chart.component />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
