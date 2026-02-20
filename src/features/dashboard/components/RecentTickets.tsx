import { memo } from 'react';
import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { DashboardRecentTicketConfig } from '../types/dashboard';

interface RecentTicketsProps {
  config: DashboardRecentTicketConfig;
}

export default function RecentTickets({ config }: RecentTicketsProps) {
  if (config.isLoading) {
    return <RecentTicketsLoading />;
  }

  if (config.hasError) {
    return <RecentTicketsError />;
  }

  return (
    <RecentTicketsCard columns={config.columns}>
      {config.ticket ? (
        config.renderTicketRow(config.ticket, config.onTicketClick)
      ) : (
        <EmptyState columnCount={config.columns.length} />
      )}
    </RecentTicketsCard>
  );
}

interface RecentTicketsCardProps {
  children: ReactNode;
  columns: Array<{ key: string; title: string }>;
}

const RecentTicketsCard = memo(function RecentTicketsCard({
  children,
  columns,
}: RecentTicketsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th key={column.key} className="p-2 text-left font-medium">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

const EmptyState = memo(function EmptyState({ columnCount }: { columnCount: number }) {
  return (
    <tr>
      <td colSpan={columnCount} className="text-muted-foreground p-4 text-center">
        No tickets found
      </td>
    </tr>
  );
});

const RecentTicketsLoading = memo(function RecentTicketsLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
});

const RecentTicketsError = memo(function RecentTicketsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support tickets and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Failed to load recent tickets</p>
      </CardContent>
    </Card>
  );
});
