'use client';

import { useMemo } from 'react';
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
import type { DashboardAiRequestStat } from '../../types/dashboard';

export const description = 'Ai analytics chart';

interface AnalyticsChartProps {
  stats: DashboardAiRequestStat[];
  isLoading: boolean;
}

export function AnalyticsChart({ stats, isLoading }: AnalyticsChartProps) {
  const chartData = useMemo(
    () =>
      stats.map((stat) => ({
        date: stat.date,
        requests: stat.requests || 0,
      })),
    [stats],
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

  if (isLoading || !chartData.length) {
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
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : 'No data available'}
            </p>
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
