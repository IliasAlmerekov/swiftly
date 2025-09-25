import { AnalyticsChart } from '@/features/dashboard/components/charts/AnalyticsChart';
import { TicketOfMonth } from '@/features/dashboard/components/charts/TicketsOfMonth';
import { Suspense } from 'react';

const Analytics = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsChart />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <TicketOfMonth />
      </Suspense>
    </div>
  );
};

export default Analytics;
