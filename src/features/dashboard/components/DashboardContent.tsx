import RecentTickets from './RecentTickets';
import UserTicketCard from './UserTicketCard';
import AdminTicketCard from './AdminTicketCard';
import ViewSupportStatus from './ViewSupportStatus';
import TicketsofThisWeek from './charts/TicketsofThisWeek';
import { HardwareChart } from './charts/HardwareChart';
import { UserTicketStats } from './charts/UserTicketStats';
import type { DashboardContentContract } from '../types/dashboard';

export function DashboardContent({
  isStaff,
  loading,
  error,
  adminSummary,
  userSummary,
  recentTickets,
  supportStatus,
  userMonthlyStats,
  userMonthlyStatsPeriodLabel,
  isUserMonthlyStatsLoading,
}: DashboardContentContract) {
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
          {isStaff ? (
            <AdminTicketCard summary={adminSummary} />
          ) : (
            <UserTicketCard summary={userSummary} />
          )}
        </div>
      )}
      {isStaff ? <TicketsofThisWeek /> : <RecentTickets config={recentTickets} />}
      {/* Recent Tickets Table */}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <ViewSupportStatus status={supportStatus} />
        {isStaff ? (
          <HardwareChart />
        ) : (
          <UserTicketStats
            stats={userMonthlyStats}
            periodLabel={userMonthlyStatsPeriodLabel}
            isLoading={isUserMonthlyStatsLoading}
          />
        )}
      </div>
    </div>
  );
}
