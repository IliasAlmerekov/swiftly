import { Pie, PieChart } from 'recharts';
import type { Ticket } from '@/types';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { useEffect, useState } from 'react';

const CHART_CONFIGS = {
  total: {
    label: 'Total Tickets',
    color: 'var(--chart-2)',
    fill: 'var(--chart-2)',
  },
  open: {
    label: 'Open Tickets',
    color: 'var(--chart-1)',
    fill: 'var(--chart-1)',
  },
  'in-progress': {
    label: 'In Progress Tickets',
    color: 'var(--chart-6)',
    fill: 'var(--chart-6)',
  },
  resolved: {
    label: 'Resolved Tickets',
    color: 'var(--chart-5)',
    fill: 'var(--chart-5)',
  },
} as const;

export type ChartType = keyof typeof CHART_CONFIGS;

interface TicketStatusChartProps {
  allTickets?: Ticket[];
  type: ChartType;
  showLabel?: boolean;
}

export function TicketStatusChart({ allTickets, type, showLabel = false }: TicketStatusChartProps) {
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [filteredTickets, setFilteredTickets] = useState<number>(0);

  useEffect(() => {
    if (!allTickets) return;

    const total = allTickets.length;
    setTotalTickets(total);

    if (type === 'total') {
      setFilteredTickets(total);
    } else {
      const filtered = allTickets.filter((ticket) => ticket.status === type).length;
      setFilteredTickets(filtered);
    }
  }, [allTickets, type]);

  const config = CHART_CONFIGS[type];

  const chartData =
    type === 'total'
      ? [
          {
            status: config.label,
            count: totalTickets,
            fill: config.fill,
          },
        ]
      : totalTickets > 0
        ? [
            {
              status: config.label,
              count: filteredTickets,
              fill: config.fill,
            },
            {
              status: 'Total Tickets',
              count: totalTickets - filteredTickets,
              fill: 'var(--chart-2)',
            },
          ]
        : [
            {
              status: 'No Data',
              count: 1,
              fill: 'var(--muted)',
            },
          ];

  const chartConfig = {
    count: {
      label: type === 'total' ? 'Total Tickets' : 'Tickets',
    },
    [type]: {
      label: config.label,
      color: config.color,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={type === 'total' ? 0 : 30}
          outerRadius={80}
          stroke={type === 'total' ? 'none' : 'var(--background)'}
          strokeWidth={type === 'total' ? 0 : 2}
          label={showLabel ? ({ value }) => `${value}` : undefined}
        />
      </PieChart>
    </ChartContainer>
  );
}

export function TotalTicketsChart({ allTickets }: { allTickets?: Ticket[] }) {
  return <TicketStatusChart allTickets={allTickets} type="total" showLabel />;
}

export function OpenTicketsChart({ allTickets }: { allTickets?: Ticket[] }) {
  return <TicketStatusChart allTickets={allTickets} type="open" />;
}

export function InProgressChart({ allTickets }: { allTickets?: Ticket[] }) {
  return <TicketStatusChart allTickets={allTickets} type="in-progress" />;
}

export function ResolvedChart({ allTickets }: { allTickets?: Ticket[] }) {
  return <TicketStatusChart allTickets={allTickets} type="resolved" />;
}
