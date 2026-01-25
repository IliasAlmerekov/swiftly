import RecentTickets from './RecentTickets';
import UserTicketCard from './UserTicketCard';
import AdminTicketCard from './AdminTicketCard';
import ViewSupportStatus from './ViewSupportStatus';
import TicketsofThisWeek from './charts/TicketsofThisWeek';
import type { Ticket } from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { HardwareChart } from './charts/HardwareChart';
import { UserTicketStats } from './charts/UserTicketStats';

interface DashboardContentProps {
  userTickets?: Ticket[];
  loading?: boolean;
  error?: string | null;
}

export function DashboardContent({ userTickets, loading, error }: DashboardContentProps) {
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-sm">Loading...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-sm text-red-500">Error: {error}</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isStaff ? <AdminTicketCard /> : <UserTicketCard />}
        </div>
      )}
      {isStaff ? <TicketsofThisWeek /> : <RecentTickets userTickets={userTickets} />}
      {/* Recent Tickets Table */}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <ViewSupportStatus />
        {isStaff ? <HardwareChart /> : <UserTicketStats />}
      </div>
    </div>
  );
}
