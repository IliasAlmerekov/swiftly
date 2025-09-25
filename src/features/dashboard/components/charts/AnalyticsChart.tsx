'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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
import { useEffect, useMemo, useState } from 'react';
import { getAIStats } from '@/api/api';

export const description = 'Ai analytics chart';

interface AIStatsData {
  stats: Array<{
    ai_requests: number;
    date: string;
  }>;
}

export function AnalyticsChart() {
  const [data, setData] = useState<AIStatsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getAIStats();
        setData(stats as AIStatsData);
        console.log(stats);
      } catch (error) {
        console.error('Failed to fetch AI stats:', error);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(
    () =>
      data?.stats && Array.isArray(data.stats)
        ? data.stats.map((stat) => ({
            date: stat.date,
            requests: stat.ai_requests || 0,
          }))
        : [],
    [data?.stats],
  );

  const chartConfig = useMemo(
    () =>
      ({
        requests: {
          label: 'AI Requests',
          color: 'var(--chart-6)',
        },
      }) satisfies ChartConfig,
    [],
  );

  if (!data || !chartData.length) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>AI Analytics</CardTitle>
            <CardDescription>AI requests statistics for the last 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">{data ? 'No data available' : 'Loading...'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>AI Analytics</CardTitle>
          <CardDescription>AI requests statistics for the last 30 days</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-6)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-6)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="requests"
              type="natural"
              fill="url(#fillRequests)"
              stroke="var(--chart-6)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
