import { memo } from 'react';
import { IconClock, IconTicket, IconUser } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { StatusRow } from '@/shared/components/ui/status-row';
import type { DashboardSupportStatus } from '../types/dashboard';

interface ViewSupportStatusProps {
  status: DashboardSupportStatus;
}

const ViewSupportStatus = memo(function ViewSupportStatus({ status }: ViewSupportStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Team Status</CardTitle>
        <CardDescription>Current availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusRow
          icon={IconUser}
          iconClassName="text-green-500"
          label="Online Support"
          value={`${status.onlineSupportCount} / ${status.totalSupportCount} Available`}
        />
        <StatusRow
          icon={IconUser}
          iconClassName="text-blue-500"
          label="Total Admins"
          value={status.totalSupportCount}
        />
        <StatusRow
          icon={IconClock}
          iconClassName="text-orange-500"
          label="Response Time"
          value={status.responseTimeLabel ?? '~30 min'}
        />
        <StatusRow
          icon={IconTicket}
          iconClassName="text-blue-500"
          label="Tickets Today"
          value={status.ticketsTodayCount}
        />
      </CardContent>
    </Card>
  );
});

export default ViewSupportStatus;
