'use client';

import { useCallback, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import type { DashboardMonthlyStat } from '../../types/dashboard';

export const description = 'Ticket of month chart';

interface TicketOfMonthProps {
  stats: DashboardMonthlyStat[];
  periodLabel: string;
  isLoading: boolean;
}

export function TicketOfMonth({ stats, periodLabel, isLoading }: TicketOfMonthProps) {
  const chartData = useMemo(
    () =>
      stats.map((stat) => ({
        month: stat.month,
        ticket: stat.count || 0,
      })),
    [stats],
  );

  const chartConfig = useMemo(
    () =>
      ({
        count: {
          label: 'Count',
          color: 'var(--chart-6)',
        },
      }) satisfies ChartConfig,
    [],
  );

  const tickFormatter = useCallback((value: string) => value.slice(0, 3), []);

  const tooltipContent = useMemo(() => <ChartTooltipContent hideLabel />, []);

  return (
    <Card className="mt-5 w-[500px]">
      <CardHeader>
        <CardTitle>Requests overview</CardTitle>
        <CardDescription>{isLoading ? 'Loading...' : periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={tickFormatter}
            />
            <ChartTooltip cursor={false} content={tooltipContent} />
            <Bar dataKey="ticket" fill="var(--chart-6)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
