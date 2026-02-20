import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ticket, User } from '@/types';
import { render, screen } from '@/test/test-utils';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDashboardData } from '@/app/hooks/useDashboardData';
import DashboardPage from './DashboardPage';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/app/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

vi.mock('@/features/tickets', () => ({
  CreateTicket: () => <div>Create ticket view</div>,
  Tickets: () => <div>Tickets view</div>,
  TICKET_COLUMNS: [{ key: 'title', title: 'Title' }],
  TicketRow: ({
    ticket,
    onTicketClick,
  }: {
    ticket: { _id: string; title: string };
    onTicketClick: (ticketId: string) => void;
  }) => (
    <tr>
      <td>
        <button type="button" onClick={() => onTicketClick(ticket._id)}>
          {ticket.title}
        </button>
      </td>
    </tr>
  ),
}));

vi.mock('@/features/dashboard', async () => {
  const actual =
    await vi.importActual<typeof import('@/features/dashboard')>('@/features/dashboard');

  return {
    ...actual,
    DashboardContent: () => <div>Dashboard overview content</div>,
    Analytics: () => <div>Analytics content</div>,
    useGreeting: () => ({ greeting: 'Hello' }),
  };
});

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseDashboardData = vi.mocked(useDashboardData);

const baseUser: User = {
  _id: 'u1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const baseTicket: Ticket = {
  _id: 't1',
  owner: baseUser,
  title: 'Printer is offline',
  description: 'Office printer not responding',
  status: 'open',
  priority: 'low',
  createdBy: baseUser,
  comments: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

beforeEach(() => {
  window.history.pushState({}, '', '/dashboard?tab=dashboard');

  mockedUseAuth.mockReturnValue({
    userId: 'u1',
    role: 'user',
    email: 'user@example.com',
    userName: 'Test User',
    isLoading: false,
    isAuthenticated: true,
  });

  mockedUseDashboardData.mockReturnValue({
    adminSummary: {
      totalTickets: 10,
      openTickets: 5,
      inProgressTickets: 3,
      resolvedTickets: 2,
    },
    userSummary: {
      totalTickets: 4,
      openTickets: 2,
      inProgressTickets: 1,
      resolvedTickets: 1,
    },
    recentTicket: baseTicket,
    isRecentTicketsLoading: false,
    isRecentTicketsError: false,
    supportStatus: {
      onlineSupportCount: 2,
      totalSupportCount: 3,
      ticketsTodayCount: 1,
      responseTimeLabel: '~30 min',
    },
    userMonthlyStats: [{ month: 'Jan', count: 1 }],
    userMonthlyStatsPeriodLabel: 'Last 6 months',
    isUserMonthlyStatsLoading: false,
    aiStats: [{ date: '2025-01-01', requests: 5 }],
    isAiStatsLoading: false,
    monthlyTicketStats: [{ month: 'Jan', count: 8 }],
    monthlyTicketStatsPeriodLabel: 'January - January 2025',
    isMonthlyTicketStatsLoading: false,
    isAdminMetricsLoading: false,
    isAdminMetricsError: false,
    isUserMetricsLoading: false,
    isUserMetricsError: false,
  });
});

describe('DashboardPage role rendering', () => {
  it('renders dashboard overview for user role', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Hello, Test User!')).toBeInTheDocument();
    expect(screen.getByText('Dashboard overview content')).toBeInTheDocument();
  });

  it('renders analytics tab for admin role', () => {
    window.history.pushState({}, '', '/dashboard?tab=analytics');
    mockedUseAuth.mockReturnValue({
      userId: 'u1',
      role: 'admin',
      email: 'admin@example.com',
      userName: 'Admin User',
      isLoading: false,
      isAuthenticated: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText('Analytics content')).toBeInTheDocument();
  });

  it('shows access restricted for analytics tab when user is not staff', () => {
    window.history.pushState({}, '', '/dashboard?tab=analytics');

    render(<DashboardPage />);

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.queryByText('Analytics content')).not.toBeInTheDocument();
  });
});
