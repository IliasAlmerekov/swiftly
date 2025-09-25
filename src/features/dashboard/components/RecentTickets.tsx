import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

import {
  getPriorityColor,
  getStatusColor,
} from "@/features/tickets/utils/ticketUtils";
import type { Ticket } from "@/types";

interface RecentTicketsProps {
  userTickets?: Ticket[];
}

export default function RecentTickets({ userTickets }: RecentTicketsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>
          Latest support tickets and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Ticket ID</th>
                <th className="text-left p-2 font-medium">Subject</th>
                <th className="text-left p-2 font-medium">Priority</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {userTickets?.length === 0 ? (
                <tr>
                  <td colSpan={5}>No tickets found</td>
                </tr>
              ) : (
                userTickets?.map((ticket, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">
                      {ticket._id.slice(0, 8)}
                    </td>
                    <td className="p-2">{ticket.title}</td>
                    <td className="p-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {ticket.assignedTo?.name || "Unassigned"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
