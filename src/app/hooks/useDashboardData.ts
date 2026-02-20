import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAIStats,
  getAllTickets,
  getTicketStatsOfMonth,
  getTickets,
  getUserTicketStats,
} from '@/features/tickets';
import { activityInterval, getSupportUsers, setUserStatusOnline } from '@/features/users';
import type { Ticket } from '@/types';
import type {
  DashboardAiRequestStat,
  DashboardMonthlyStat,
  DashboardSupportStatus,
  DashboardTicketSummary,
} from '@/features/dashboard/types/dashboard';

const EMPTY_TICKET_SUMMARY: DashboardTicketSummary = {
  totalTickets: 0,
  openTickets: 0,
  inProgressTickets: 0,
  resolvedTickets: 0,
};

const calculateTicketSummary = (tickets: Ticket[]): DashboardTicketSummary => ({
  totalTickets: tickets.length,
  openTickets: tickets.filter((ticket) => ticket.status === 'open').length,
  inProgressTickets: tickets.filter((ticket) => ticket.status === 'in-progress').length,
  resolvedTickets: tickets.filter(
    (ticket) => ticket.status === 'resolved' || ticket.status === 'closed',
  ).length,
});

const normalizeAiStats = (rawStats: unknown): DashboardAiRequestStat[] => {
  const statsSource = Array.isArray(rawStats)
    ? rawStats
    : rawStats &&
        typeof rawStats === 'object' &&
        Array.isArray((rawStats as { stats?: unknown }).stats)
      ? (rawStats as { stats: unknown[] }).stats
      : [];

  return statsSource
    .filter(
      (entry): entry is { date: string; ai_requests: number } =>
        !!entry &&
        typeof entry === 'object' &&
        'date' in entry &&
        'ai_requests' in entry &&
        typeof (entry as { date: unknown }).date === 'string' &&
        typeof (entry as { ai_requests: unknown }).ai_requests === 'number',
    )
    .map((entry) => ({
      date: entry.date,
      requests: entry.ai_requests,
    }));
};

export function useDashboardData() {
  const {
    data: userTicketsPage,
    isLoading: isUserTicketsLoading,
    isError: isUserTicketsError,
  } = useQuery({
    queryKey: ['dashboard', 'user-tickets'],
    queryFn: () => getTickets({ scope: 'mine' }),
  });

  const {
    data: allTicketsPage,
    isLoading: isAllTicketsLoading,
    isError: isAllTicketsError,
  } = useQuery({
    queryKey: ['dashboard', 'all-tickets'],
    queryFn: () => getAllTickets(),
  });

  const { data: ticketsTodayCount = 0 } = useQuery({
    queryKey: ['dashboard', 'tickets-today'],
    queryFn: () => getTickets({ scope: 'mine', date: 'today' }),
    select: (ticketPage) => ticketPage?.items?.length ?? 0,
    refetchInterval: 5 * 60_000,
  });

  const { data: supportUsers } = useQuery({
    queryKey: ['dashboard', 'support-users'],
    queryFn: getSupportUsers,
    select: (adminList) => ({
      online: adminList?.onlineCount ?? 0,
      total: adminList?.totalCount ?? 0,
    }),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const { data: userTicketStatsResponse, isLoading: isUserTicketStatsLoading } = useQuery({
    queryKey: ['dashboard', 'user-ticket-stats'],
    queryFn: getUserTicketStats,
  });

  const { data: aiStatsResponse, isLoading: isAiStatsLoading } = useQuery({
    queryKey: ['dashboard', 'ai-stats'],
    queryFn: getAIStats,
  });

  const { data: monthlyTicketStatsResponse, isLoading: isMonthlyTicketStatsLoading } = useQuery({
    queryKey: ['dashboard', 'monthly-ticket-stats'],
    queryFn: getTicketStatsOfMonth,
  });

  useEffect(() => {
    void setUserStatusOnline();

    const intervalId = window.setInterval(() => {
      void activityInterval();
    }, 2 * 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const userSummary = useMemo(() => {
    const userTickets = userTicketsPage?.items ?? [];
    return userTickets.length ? calculateTicketSummary(userTickets) : EMPTY_TICKET_SUMMARY;
  }, [userTicketsPage?.items]);

  const adminSummary = useMemo(() => {
    const allTickets = allTicketsPage?.items ?? [];
    return allTickets.length ? calculateTicketSummary(allTickets) : EMPTY_TICKET_SUMMARY;
  }, [allTicketsPage?.items]);

  const recentTicket = userTicketsPage?.items?.[0] ?? null;

  const supportStatus: DashboardSupportStatus = useMemo(
    () => ({
      onlineSupportCount: supportUsers?.online ?? 0,
      totalSupportCount: supportUsers?.total ?? 0,
      ticketsTodayCount,
      responseTimeLabel: '~30 min',
    }),
    [supportUsers, ticketsTodayCount],
  );

  const userMonthlyStats: DashboardMonthlyStat[] = useMemo(
    () =>
      userTicketStatsResponse?.stats?.map((entry) => ({
        month: entry.month,
        count: entry.count || 0,
      })) ?? [],
    [userTicketStatsResponse?.stats],
  );

  const userMonthlyStatsPeriodLabel = userTicketStatsResponse?.period ?? 'No data available';

  const monthlyTicketStats: DashboardMonthlyStat[] = useMemo(
    () =>
      monthlyTicketStatsResponse?.stats?.map((entry) => ({
        month: entry.month,
        count: entry.count || 0,
      })) ?? [],
    [monthlyTicketStatsResponse?.stats],
  );

  const monthlyTicketStatsPeriodLabel =
    monthlyTicketStatsResponse && monthlyTicketStatsResponse.stats.length > 0
      ? `January - ${monthlyTicketStatsResponse.stats[monthlyTicketStatsResponse.stats.length - 1]?.month} ${monthlyTicketStatsResponse.currentYear}`
      : 'No data available';

  const aiStats = useMemo(() => normalizeAiStats(aiStatsResponse), [aiStatsResponse]);

  return {
    adminSummary,
    userSummary,
    recentTicket,
    isRecentTicketsLoading: isUserTicketsLoading,
    isRecentTicketsError: isUserTicketsError,
    supportStatus,
    userMonthlyStats,
    userMonthlyStatsPeriodLabel,
    isUserMonthlyStatsLoading: isUserTicketStatsLoading,
    aiStats,
    isAiStatsLoading,
    monthlyTicketStats,
    monthlyTicketStatsPeriodLabel,
    isMonthlyTicketStatsLoading,
    isAdminMetricsLoading: isAllTicketsLoading,
    isAdminMetricsError: isAllTicketsError,
    isUserMetricsLoading: isUserTicketsLoading,
    isUserMetricsError: isUserTicketsError,
  };
}
