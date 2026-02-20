import { AnalyticsChart } from '@/features/dashboard/components/charts/AnalyticsChart';
import { TicketOfMonth } from '@/features/dashboard/components/charts/TicketsOfMonth';
import { Suspense } from 'react';
import type { DashboardAnalyticsContract } from '../types/dashboard';

const Analytics = ({
  aiStats,
  isAiStatsLoading,
  monthlyTicketStats,
  monthlyTicketStatsPeriodLabel,
  isMonthlyTicketStatsLoading,
}: DashboardAnalyticsContract) => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsChart stats={aiStats} isLoading={isAiStatsLoading} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <TicketOfMonth
          stats={monthlyTicketStats}
          periodLabel={monthlyTicketStatsPeriodLabel}
          isLoading={isMonthlyTicketStatsLoading}
        />
      </Suspense>
    </div>
  );
};

export default Analytics;
