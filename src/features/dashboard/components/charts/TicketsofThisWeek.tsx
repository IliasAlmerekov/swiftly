import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

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

export const description = 'A bar chart with a custom label';

const chartData = [
  { weekDay: 'Monday', desktop: 186, mobile: 80 },
  { weekDay: 'Tuesday', desktop: 305, mobile: 200 },
  { weekDay: 'Wednesday', desktop: 237, mobile: 120 },
  { weekDay: 'Thursday', desktop: 73, mobile: 190 },
  { weekDay: 'Friday', desktop: 209, mobile: 130 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-6)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-6)',
  },
  label: {
    color: 'var(--chart-text)',
  },
} satisfies ChartConfig;

export default function TicketsofThisWeek() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Tickets This Week</CardTitle>
          <CardDescription className="text-md">Monday - Friday</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <ChartContainer config={chartConfig} className="h-56">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="weekDay"
                type="category"
                tickLine={false}
                tickMargin={15}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="desktop" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="desktop" layout="vertical" fill="var(--color-desktop)" radius={4}>
                <LabelList
                  dataKey="weekDay"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)"
                  fontSize={15}
                />
                <LabelList
                  dataKey="desktop"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={14}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
