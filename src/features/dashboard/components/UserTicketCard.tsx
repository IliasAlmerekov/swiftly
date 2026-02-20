import { memo, useMemo } from 'react';
import { IconTicket, IconUsers, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { MetricCard } from '@/shared/components/ui/metric-card';
import type { DashboardTicketSummary } from '../types/dashboard';

interface MetricConfig {
  title: string;
  key: keyof DashboardTicketSummary;
  icon: typeof IconTicket;
  description: string;
}

const METRICS_CONFIG: MetricConfig[] = [
  {
    title: 'Total Tickets',
    key: 'totalTickets',
    icon: IconTicket,
    description: 'All time tickets',
  },
  {
    title: 'Open Tickets',
    key: 'openTickets',
    icon: IconClock,
    description: 'Currently open',
  },
  {
    title: 'In Progress Tickets',
    key: 'inProgressTickets',
    icon: IconUsers,
    description: 'Being worked on',
  },
  {
    title: 'Resolved Tickets',
    key: 'resolvedTickets',
    icon: IconCircleCheck,
    description: 'Resolved or closed',
  },
];

interface UserTicketCardProps {
  summary: DashboardTicketSummary;
}

const UserTicketCard = memo(function UserTicketCard({ summary }: UserTicketCardProps) {
  const metricsData = useMemo(
    () =>
      METRICS_CONFIG.map((config) => ({
        ...config,
        value: summary[config.key] ?? 0,
      })),
    [summary],
  );

  return (
    <>
      {metricsData.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
        />
      ))}
    </>
  );
});

export default UserTicketCard;
