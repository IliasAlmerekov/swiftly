import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { activityInterval, setUserStatusOnline } from '@/api/api';
import { getSupportUsers, getUserTickets } from '@/api/api';
import { IconClock, IconTicket, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function ViewSupportStatus() {
  const [supportAdminsNow, setSupportAdminsNow] = useState<number>(0);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [createdTicketsToday, setCreatedTicketsToday] = useState<number>(0);

  useEffect(() => {
    const fetchUserTicketsToday = async () => {
      try {
        const tickets = await getUserTickets();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTickets = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.createdAt);
          ticketDate.setHours(0, 0, 0, 0);
          return ticketDate.getTime() === today.getTime();
        });
        setCreatedTicketsToday(todayTickets.length);
      } catch (error) {
        console.error("Failed to fetch user's tickets today:", error);
      }
    };

    const fetchSupportAdmins = async () => {
      try {
        const response = await getSupportUsers();
        setSupportAdminsNow(response.onlineCount || 0);
        setTotalAdmins(response.totalCount || 0);
      } catch (error) {
        console.error('Failed to fetch support users:', error);
      }
    };

    fetchUserTicketsToday();
    fetchSupportAdmins();
    setUserStatusOnline();

    const activeInterval = setInterval(
      () => {
        activityInterval();
      },
      2 * 60 * 1000,
    );

    const supportAdminsInterval = setInterval(() => {
      fetchSupportAdmins();
    }, 30 * 1000);

    return () => {
      clearInterval(activeInterval);
      clearInterval(supportAdminsInterval);
    };
  }, []);

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
            {supportAdminsNow} / {totalAdmins} Available
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
          <span className="text-sm font-medium">{createdTicketsToday}</span>
        </div>
      </CardContent>
    </Card>
  );
}
