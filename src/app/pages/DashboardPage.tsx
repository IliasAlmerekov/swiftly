import React, { useCallback } from 'react';
import type { TabType } from '@/types';
import { paths } from '@/config/paths';
import {
  Analytics,
  DashboardContent,
  DashboardTabContent,
  type DashboardTabComponents,
} from '@/features/dashboard';
import { CreateTicket, TicketRow, Tickets, TICKET_COLUMNS } from '@/features/tickets';
import {
  DashboardPageContractProvider,
  useDashboardPageContract,
} from '@/app/pages/dashboard-page-contract';

const DashboardPageContent: React.FC = () => {
  const {
    useSearchParams: useSearchParamsHook,
    useNavigate: useNavigateHook,
    useAuth: useAuthHook,
    useGreeting: useGreetingHook,
    useDashboardData: useDashboardDataHook,
  } = useDashboardPageContract();
  const [searchParams] = useSearchParamsHook();
  const navigate = useNavigateHook();
  const { role, userName } = useAuthHook();
  const { greeting } = useGreetingHook();
  const dashboardData = useDashboardDataHook();

  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'dashboard';
  const isStaff = role === 'admin' || role === 'support1';

  const handleTicketClick = useCallback(
    (ticketId: string) => {
      navigate(paths.app.ticket.getHref(ticketId));
    },
    [navigate],
  );

  const DashboardOverview = () => (
    <DashboardContent
      isStaff={isStaff}
      loading={isStaff ? dashboardData.isAdminMetricsLoading : dashboardData.isUserMetricsLoading}
      error={
        isStaff
          ? dashboardData.isAdminMetricsError
            ? 'Failed to load metrics'
            : null
          : dashboardData.isUserMetricsError
            ? 'Failed to load metrics'
            : null
      }
      adminSummary={dashboardData.adminSummary}
      userSummary={dashboardData.userSummary}
      recentTickets={{
        ticket: dashboardData.recentTicket,
        isLoading: dashboardData.isRecentTicketsLoading,
        hasError: dashboardData.isRecentTicketsError,
        columns: TICKET_COLUMNS.map((column) => ({ key: column.key, title: column.title })),
        onTicketClick: handleTicketClick,
        renderTicketRow: (ticket, onTicketClick) => (
          <TicketRow ticket={ticket} onTicketClick={onTicketClick} />
        ),
      }}
      supportStatus={dashboardData.supportStatus}
      userMonthlyStats={dashboardData.userMonthlyStats}
      userMonthlyStatsPeriodLabel={dashboardData.userMonthlyStatsPeriodLabel}
      isUserMonthlyStatsLoading={dashboardData.isUserMonthlyStatsLoading}
    />
  );

  const AnalyticsOverview = () => (
    <Analytics
      aiStats={dashboardData.aiStats}
      isAiStatsLoading={dashboardData.isAiStatsLoading}
      monthlyTicketStats={dashboardData.monthlyTicketStats}
      monthlyTicketStatsPeriodLabel={dashboardData.monthlyTicketStatsPeriodLabel}
      isMonthlyTicketStatsLoading={dashboardData.isMonthlyTicketStatsLoading}
    />
  );

  const tabComponents: DashboardTabComponents = {
    dashboard: DashboardOverview,
    tickets: Tickets,
    createTicket: CreateTicket,
    analytics: AnalyticsOverview,
  };

  return (
    <DashboardTabContent
      currentTab={currentTab}
      components={tabComponents}
      role={role}
      userName={userName ?? ''}
      greeting={greeting}
    />
  );
};

const DashboardPage: React.FC = () => {
  return (
    <DashboardPageContractProvider>
      <DashboardPageContent />
    </DashboardPageContractProvider>
  );
};

export default DashboardPage;
