import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTickets, type TicketListResponse } from '@/features/tickets/api';
import { MetricCard } from '@/shared/components/ui/metric-card';
import { IconTicket, IconUsers, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';
import type { Ticket } from '@/types';

// ============ Types ============
interface MetricConfig {
  title: string;
  key: 'totalTickets' | 'openTickets' | 'inProgressTickets' | 'resolvedTickets';
  icon: typeof IconTicket;
  description: string;
}

// ============ Configuration ============
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

// ============ Custom Hook for User Ticket Stats ============
function useUserTicketStats() {
  return useQuery({
    queryKey: ticketKeys.list({ scope: 'mine', view: 'summary' }),
    queryFn: () => getTickets({ scope: 'mine' }),
    select: (ticketPage: TicketListResponse) => {
      const tickets = ticketPage?.items ?? [];

      return {
        totalTickets: tickets.length,
        openTickets: tickets.filter((ticket: Ticket) => ticket.status === 'open').length,
        inProgressTickets: tickets.filter((ticket: Ticket) => ticket.status === 'in-progress')
          .length,
        resolvedTickets: tickets.filter(
          (ticket: Ticket) => ticket.status === 'resolved' || ticket.status === 'closed',
        ).length,
      };
    },
  });
}

// ============ Main Component ============
/**
 * User ticket metrics cards component.
 *
 * Follows bulletproof-react patterns:
 * - Configuration-driven metrics definition
 * - Custom hook for data fetching
 * - Memoized to prevent unnecessary re-renders
 * - Uses shared MetricCard component for consistency
 */
const UserTicketCard = memo(function UserTicketCard() {
  const { data: ticketStats } = useUserTicketStats();

  const metricsData = useMemo(
    () =>
      METRICS_CONFIG.map((config) => ({
        ...config,
        value: ticketStats?.[config.key] ?? 0,
      })),
    [ticketStats],
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
