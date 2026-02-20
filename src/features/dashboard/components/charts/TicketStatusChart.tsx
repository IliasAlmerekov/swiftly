import { useMemo } from 'react';
import { Pie, PieChart } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import type { DashboardTicketSummary } from '../../types/dashboard';

type TicketStatusVariant = 'total' | 'open' | 'inProgress' | 'resolved';

interface TicketStatusChartProps {
  variant: TicketStatusVariant;
  summary: DashboardTicketSummary;
  showLabel?: boolean;
}

export function TicketStatusChart({ variant, summary, showLabel }: TicketStatusChartProps) {
  const totalTickets = summary.totalTickets;
  const openTickets = summary.openTickets;
  const inProgressTickets = summary.inProgressTickets;
  const resolvedTickets = summary.resolvedTickets;

  const { chartData, chartConfig } = useMemo<{
    chartData: Array<{ status: string; label: string; count: number; fill: string }>;
    chartConfig: ChartConfig;
  }>(() => {
    switch (variant) {
      case 'open':
        return {
          chartData: [
            {
              status: 'openTickets',
              label: 'Open Tickets',
              count: openTickets,
              fill: 'var(--chart-1)',
            },
            {
              status: 'otherTickets',
              label: 'Total Tickets',
              count: Math.max(totalTickets - openTickets, 0),
              fill: 'var(--chart-2)',
            },
          ],
          chartConfig: {
            openTickets: {
              label: 'Open Tickets',
              color: 'var(--chart-1)',
            },
            otherTickets: {
              label: 'Total Tickets',
              color: 'var(--chart-2)',
            },
          } as ChartConfig,
        };
      case 'inProgress':
        return {
          chartData: [
            {
              status: 'inProgressTickets',
              label: 'In Progress Tickets',
              count: inProgressTickets,
              fill: 'var(--chart-6)',
            },
            {
              status: 'otherTickets',
              label: 'Total Tickets',
              count: Math.max(totalTickets - inProgressTickets, 0),
              fill: 'var(--chart-2)',
            },
          ],
          chartConfig: {
            inProgressTickets: {
              label: 'In Progress Tickets',
              color: 'var(--chart-6)',
            },
            otherTickets: {
              label: 'Total Tickets',
              color: 'var(--chart-2)',
            },
          } as ChartConfig,
        };
      case 'resolved':
        return {
          chartData: [
            {
              status: 'resolvedTickets',
              label: 'Resolved Tickets',
              count: resolvedTickets,
              fill: 'var(--chart-4)',
            },
            {
              status: 'otherTickets',
              label: 'Total Tickets',
              count: Math.max(totalTickets - resolvedTickets, 0),
              fill: 'var(--chart-2)',
            },
          ],
          chartConfig: {
            resolvedTickets: {
              label: 'Resolved Tickets',
              color: 'var(--chart-4)',
            },
            otherTickets: {
              label: 'Total Tickets',
              color: 'var(--chart-2)',
            },
          } as ChartConfig,
        };
      case 'total':
      default:
        return {
          chartData: [
            {
              status: 'totalTickets',
              label: 'Total Tickets',
              count: totalTickets,
              fill: 'var(--chart-2)',
            },
          ],
          chartConfig: {
            totalTickets: {
              label: 'Total Tickets',
              color: 'var(--chart-2)',
            },
          } as ChartConfig,
        };
    }
  }, [inProgressTickets, openTickets, resolvedTickets, totalTickets, variant]);

  const hasData = chartData.some((item) => item.count > 0);

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="label"
          innerRadius={hasData && chartData.length > 1 ? 30 : 0}
          outerRadius={80}
          stroke={hasData ? 'var(--background)' : 'none'}
          strokeWidth={hasData ? 2 : 0}
          label={showLabel ? ({ value }) => `${value}` : undefined}
        />
      </PieChart>
    </ChartContainer>
  );
}

export function TotalTicketsChart({ summary }: { summary: DashboardTicketSummary }) {
  return <TicketStatusChart variant="total" summary={summary} showLabel />;
}

export function OpenTicketsChart({ summary }: { summary: DashboardTicketSummary }) {
  return <TicketStatusChart variant="open" summary={summary} showLabel />;
}

export function InProgressChart({ summary }: { summary: DashboardTicketSummary }) {
  return <TicketStatusChart variant="inProgress" summary={summary} showLabel />;
}

export function ResolvedChart({ summary }: { summary: DashboardTicketSummary }) {
  return <TicketStatusChart variant="resolved" summary={summary} showLabel />;
}
