import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useCallback, useMemo } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export const description = 'User ticket stats chart';

interface UserTicketStatsProps {
  stats: DashboardMonthlyStat[];
  periodLabel: string;
  isLoading: boolean;
}

export function UserTicketStats({ stats, periodLabel, isLoading }: UserTicketStatsProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Your Ticket Stats</CardTitle>
        <CardDescription>{isLoading ? 'Loading...' : periodLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {isLoading ? (
          <div className="flex h-[180px] w-[450px] items-center justify-center">
            <p>Loading stats...</p>
          </div>
        ) : stats.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[180px] w-[450px]">
            <BarChart accessibilityLayer data={stats}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={tickFormatter}
              />
              <ChartTooltip cursor={false} content={tooltipContent} />
              <Bar dataKey="count" fill="var(--chart-6)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[170px] w-[500px] items-center justify-center">
            <p>No ticket data available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          This is an overview of your requests from the past six months.{' '}
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
