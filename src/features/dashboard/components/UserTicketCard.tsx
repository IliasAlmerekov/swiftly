import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Ticket } from "@/types";

import {
  IconTicket,
  IconUsers,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react";

interface UserTicketCardProps {
  title: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface UserTicketProps {
  userTickets?: Ticket[];
}

export default function UserTicketCard({ userTickets }: UserTicketProps) {
  // Simple metrics data
  const metricsData: UserTicketCardProps[] = [
    {
      title: "Total Tickets",
      value: userTickets?.length,
      icon: IconTicket,
      description: "All time tickets",
    },
    {
      title: "Open Tickets",
      value: userTickets?.filter(
        (ticket: Ticket) => ticket.status.toLocaleLowerCase() === "open"
      ).length,
      icon: IconClock,
      description: "Currently open",
    },
    {
      title: "In progress Tickets",
      value: userTickets?.filter(
        (ticket: Ticket) => ticket.status.toLocaleLowerCase() === "in-progress"
      ).length,
      icon: IconUsers,

      description: "Being worked on",
    },
    {
      title: "Resolved Tickets",
      value: userTickets?.filter(
        (ticket: Ticket) => ticket.status.toLocaleLowerCase() === "resolved"
      ).length,
      icon: IconCircleCheck,
      description: "Resolved tickets",
    },
  ];

  return (
    <>
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value ?? 0}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
