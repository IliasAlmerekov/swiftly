import { memo } from 'react';
import { MetricCard } from '@/shared/components/ui/metric-card';
import { IconTicket, IconCircleCheck, IconClock } from '@tabler/icons-react';
import {
  TotalTicketsChart,
  OpenTicketsChart,
  InProgressChart,
  ResolvedChart,
} from './charts/TicketStatusChart';
import type { DashboardTicketSummary } from '../types/dashboard';

// ============ Types ============
interface AdminChartConfig {
  key: string;
  title: string;
  icon: typeof IconTicket;
  Chart: React.ComponentType<{ summary: DashboardTicketSummary }>;
}

// ============ Configuration ============
const ADMIN_CHARTS_CONFIG: AdminChartConfig[] = [
  {
    key: 'total',
    title: 'Total Tickets',
    icon: IconTicket,
    Chart: TotalTicketsChart,
  },
  {
    key: 'open',
    title: 'Open Tickets',
    icon: IconClock,
    Chart: OpenTicketsChart,
  },
  {
    key: 'in-progress',
    title: 'In Progress Tickets',
    icon: IconClock,
    Chart: InProgressChart,
  },
  {
    key: 'resolved',
    title: 'Resolved Tickets',
    icon: IconCircleCheck,
    Chart: ResolvedChart,
  },
];

// ============ Main Component ============
/**
 * Admin ticket chart cards component.
 *
 * Follows bulletproof-react patterns:
 * - Configuration-driven chart definitions
 * - Memoized to prevent unnecessary re-renders
 * - Uses shared MetricCard component with custom children
 */
interface AdminTicketCardProps {
  summary: DashboardTicketSummary;
}

const AdminTicketCard = memo(function AdminTicketCard({ summary }: AdminTicketCardProps) {
  return (
    <>
      {ADMIN_CHARTS_CONFIG.map(({ key, title, icon, Chart }) => (
        <MetricCard key={key} title={title} value="" icon={icon}>
          <Chart summary={summary} />
        </MetricCard>
      ))}
    </>
  );
});

export default AdminTicketCard;
