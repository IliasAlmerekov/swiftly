import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserTicketStats } from '@/api/tickets';

export const description = 'User ticket stats chart';

interface TicketStatsData {
  stats: Array<{
    count: number;
    year: number;
    monthNumber: number;
    month: string;
  }>;
  period: string;
  userId: number;
}

export function UserTicketStats() {
  const [data, setData] = useState<TicketStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getUserTicketStats();
        setData(stats);
      } catch {
        // Error handled silently - data will remain null
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = useMemo(
    () =>
      data?.stats && Array.isArray(data.stats)
        ? data.stats.map((stat) => ({
            month: stat.month,
            count: stat.count || 0,
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
    <Card>
      <CardHeader>
        <CardTitle>Your Ticket Stats</CardTitle>
        <CardDescription>{loading ? 'Loading...' : data?.period}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {loading ? (
          <div className="flex h-[180px] w-[450px] items-center justify-center">
            <p>Loading stats...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[180px] w-[450px]">
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
