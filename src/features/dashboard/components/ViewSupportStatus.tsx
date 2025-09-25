import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { IconClock, IconTicket, IconUser } from '@tabler/icons-react';

interface ViewSupportStatusProps {
  supportUsers?: number;
  totalAdmins?: number;
  ticketsToday?: number;
  role?: string | null;
}

export default function ViewSupportStatus({
  supportUsers,
  totalAdmins,
  ticketsToday,
}: ViewSupportStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Team Status</CardTitle>
        <CardDescription>Current availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4 text-green-500" />
            <span className="text-sm">Online Support</span>
          </div>
          <span className="text-sm font-medium">
            {supportUsers} / {totalAdmins} Available
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Total Admins</span>
          </div>
          <span className="text-sm font-medium">{totalAdmins}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconClock className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Response Time</span>
          </div>
          <span className="text-sm font-medium">~30 min</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconTicket className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Tickets Today</span>
          </div>
          <span className="text-sm font-medium">{ticketsToday}</span>
        </div>
      </CardContent>
    </Card>
  );
}
