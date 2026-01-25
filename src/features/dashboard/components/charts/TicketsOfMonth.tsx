'use client';

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
import { getTicketStatsOfMonth, type TicketStatsOfMonth } from '@/api/tickets';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const description = 'Ticket of month chart';

export function TicketOfMonth() {
  const [data, setData] = useState<TicketStatsOfMonth | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getTicketStatsOfMonth();
        setData(stats);
      } catch {
        // Error handled silently - data will remain null
      }
    };
    fetchStats();
  }, []);

  const chartData = useMemo(
    () =>
      data?.stats && Array.isArray(data.stats)
        ? data.stats.map((stat) => ({
            month: stat.month,
            Ticket: stat.count || 0,
          }))
        : [],
    [data?.stats],
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
        <CardDescription>
          {data?.currentYear
            ? `January - ${data.stats[data.stats.length - 1]?.month} ${data?.currentYear}`
            : 'Loading...'}
        </CardDescription>
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
            <Bar dataKey="Ticket" fill="var(--chart-6)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
