import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getTickets, type TicketListResponse } from '@/features/tickets/api';
import { activityInterval, getSupportUsers, setUserStatusOnline } from '@/features/users/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { IconClock, IconTicket, IconUser } from '@tabler/icons-react';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';

export default function ViewSupportStatus() {
  const { data: supportUsers } = useQuery({
    queryKey: ['support-users'],
    queryFn: getSupportUsers,
    select: (adminList) => ({
      online: adminList?.onlineCount ?? 0,
      total: adminList?.totalCount ?? 0,
    }),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const { data: ticketsTodayCount = 0 } = useQuery({
    queryKey: ticketKeys.list({ scope: 'mine', date: 'today' }),
    queryFn: () => getTickets({ scope: 'mine', date: 'today' }),
    select: (ticketPage: TicketListResponse) => {
      const tickets = ticketPage?.items ?? [];
      return tickets.length;
    },
    refetchInterval: 5 * 60_000,
  });

  const heartbeat = useMutation({ mutationFn: activityInterval });
  const markOnline = useMutation({ mutationFn: setUserStatusOnline });

  useEffect(() => {
    markOnline.mutate();

    const id = window.setInterval(() => {
      heartbeat.mutate();
    }, 2 * 60_000);

    return () => {
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {supportUsers?.online ?? 0} / {supportUsers?.total ?? 0} Available
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Total Admins</span>
          </div>
          <span className="text-sm font-medium">{supportUsers?.total ?? 0}</span>
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
          <span className="text-sm font-medium">{ticketsTodayCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
