import type { ReactNode } from 'react';
import type { Ticket, UserRole } from '@/types';

export interface DashboardTicketSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export interface DashboardSupportStatus {
  onlineSupportCount: number;
  totalSupportCount: number;
  ticketsTodayCount: number;
  responseTimeLabel?: string;
}

export interface DashboardMonthlyStat {
  month: string;
  count: number;
}

export interface DashboardAiRequestStat {
  date: string;
  requests: number;
}

export interface DashboardRecentTicketConfig {
  ticket: Ticket | null;
  isLoading: boolean;
  hasError: boolean;
  columns: Array<{ key: string; title: string }>;
  onTicketClick: (ticketId: string) => void;
  renderTicketRow: (ticket: Ticket, onTicketClick: (ticketId: string) => void) => ReactNode;
}

export interface DashboardContentContract {
  isStaff: boolean;
  loading?: boolean;
  error?: string | null;
  adminSummary: DashboardTicketSummary;
  userSummary: DashboardTicketSummary;
  recentTickets: DashboardRecentTicketConfig;
  supportStatus: DashboardSupportStatus;
  userMonthlyStats: DashboardMonthlyStat[];
  userMonthlyStatsPeriodLabel: string;
  isUserMonthlyStatsLoading: boolean;
}

export interface DashboardAnalyticsContract {
  aiStats: DashboardAiRequestStat[];
  isAiStatsLoading: boolean;
  monthlyTicketStats: DashboardMonthlyStat[];
  monthlyTicketStatsPeriodLabel: string;
  isMonthlyTicketStatsLoading: boolean;
}

export interface DashboardTabComponents {
  dashboard: React.ComponentType;
  tickets: React.ComponentType;
  createTicket: React.ComponentType;
  analytics: React.ComponentType;
}

export interface DashboardTabRuntime {
  role: UserRole | null;
  userName: string;
  greeting: string;
}
