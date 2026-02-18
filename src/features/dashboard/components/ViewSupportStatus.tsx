import { memo, useEffect } from 'react';
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
import { StatusRow } from '@/shared/components/ui/status-row';
import { IconClock, IconTicket, IconUser } from '@tabler/icons-react';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';

// ============ Custom Hook for Support Status Data ============
function useSupportStatusData() {
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
    select: (ticketPage: TicketListResponse) => ticketPage?.items?.length ?? 0,
    refetchInterval: 5 * 60_000,
  });

  return { supportUsers, ticketsTodayCount };
}

// ============ Custom Hook for Heartbeat ============
function useHeartbeat() {
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
}

// ============ Main Component ============
/**
 * Support team status card component.
 *
 * Follows bulletproof-react patterns:
 * - Custom hooks for data fetching and side effects
 * - Uses shared StatusRow component
 * - Memoized to prevent unnecessary re-renders
 */
const ViewSupportStatus = memo(function ViewSupportStatus() {
  const { supportUsers, ticketsTodayCount } = useSupportStatusData();
  useHeartbeat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Team Status</CardTitle>
        <CardDescription>Current availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusRow
          icon={IconUser}
          iconClassName="text-green-500"
          label="Online Support"
          value={`${supportUsers?.online ?? 0} / ${supportUsers?.total ?? 0} Available`}
        />
        <StatusRow
          icon={IconUser}
          iconClassName="text-blue-500"
          label="Total Admins"
          value={supportUsers?.total ?? 0}
        />
        <StatusRow
          icon={IconClock}
          iconClassName="text-orange-500"
          label="Response Time"
          value="~30 min"
        />
        <StatusRow
          icon={IconTicket}
          iconClassName="text-blue-500"
          label="Tickets Today"
          value={ticketsTodayCount}
        />
      </CardContent>
    </Card>
  );
});

export default ViewSupportStatus;
