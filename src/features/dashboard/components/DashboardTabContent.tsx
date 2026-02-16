import React, { memo, useMemo } from 'react';
import { DashboardContent } from './DashboardContent';
import { CreateTicket } from '@/features/tickets/pages/CreateTicket';
import { Tickets } from '@/features/tickets/pages/Tickets';
import Analytics from '@/features/dashboard/pages/Analytics';
import type { TabType } from '@/types';
import { useGreeting } from '../hooks/useGreeting';
import { useAuth } from '@/shared/hooks/useAuth';
import { TabPageLayout } from '@/shared/components/layout/TabPageLayout';

// ============ Types ============
interface DashboardTabContentProps {
  currentTab: TabType;
}

interface TabConfig {
  title: string | ((userName: string, greeting: string) => React.ReactNode);
  subtitle: string;
  component: React.ComponentType;
  staffOnly?: boolean;
  contentClassName?: string;
}

// ============ Access Restricted Component ============
const AccessRestricted = memo(function AccessRestricted() {
  return (
    <TabPageLayout
      title="Access Restricted"
      subtitle="You do not have permission to view this section."
    >
      <div />
    </TabPageLayout>
  );
});

// ============ Welcome Page Component ============
const WelcomePage = memo(function WelcomePage() {
  return (
    <TabPageLayout title="Welcome" subtitle="Select an option from the sidebar to get started">
      <div />
    </TabPageLayout>
  );
});

// ============ Tab Configurations ============
const TAB_CONFIG: Partial<Record<TabType, TabConfig>> = {
  dashboard: {
    title: (userName, greeting) => (
      <h1 className="text-2xl font-semibold">
        {greeting}, {userName}!
      </h1>
    ),
    subtitle: "Welcome back. Here's an overview of your support tickets.",
    component: DashboardContent,
  },
  'admin-dashboard': {
    title: (userName, greeting) => (
      <>
        <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
        <h2 className="text-2xl font-semibold">
          {greeting}, {userName}!
        </h2>
      </>
    ),
    subtitle: 'Administrative overview and controls',
    component: DashboardContent,
    staffOnly: true,
  },
  tickets: {
    title: 'Tickets',
    subtitle: 'View and manage support tickets',
    component: Tickets,
  },
  'create-ticket': {
    title: 'Create New Ticket',
    subtitle: 'Submit a new support request',
    component: CreateTicket,
    contentClassName: 'p-4 lg:p-6',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Performance metrics and detailed reports',
    component: Analytics,
    staffOnly: true,
  },
};

const STAFF_ONLY_TABS: TabType[] = ['admin-dashboard', 'analytics'];

// ============ Tab Content Renderer ============
interface TabContentRendererProps {
  config: TabConfig;
  userName: string;
  greeting: string;
}

const TabContentRenderer = memo(function TabContentRenderer({
  config,
  userName,
  greeting,
}: TabContentRendererProps) {
  const { title, subtitle, component: Component, contentClassName } = config;

  const resolvedTitle = useMemo(
    () => (typeof title === 'function' ? title(userName, greeting) : title),
    [title, userName, greeting],
  );

  return (
    <TabPageLayout title={resolvedTitle} subtitle={subtitle} contentClassName={contentClassName}>
      <Component />
    </TabPageLayout>
  );
});

// ============ Main Component ============
/**
 * Dashboard tab content router.
 *
 * Follows bulletproof-react patterns:
 * - Configuration-driven approach for tab definitions
 * - Single Responsibility: Only handles tab routing logic
 * - Memoized sub-components prevent unnecessary re-renders
 * - Centralized access control for staff-only tabs
 */
export const DashboardTabContent: React.FC<DashboardTabContentProps> = memo(
  function DashboardTabContent({ currentTab }) {
    const { greeting } = useGreeting();
    const { userName, role } = useAuth();
    const isStaff = role === 'admin' || role === 'support1';

    // Check access for staff-only tabs
    const hasAccess = useMemo(() => {
      if (STAFF_ONLY_TABS.includes(currentTab) && !isStaff) {
        return false;
      }
      return true;
    }, [currentTab, isStaff]);

    // Get tab configuration
    const tabConfig = TAB_CONFIG[currentTab];

    if (!hasAccess) {
      return <AccessRestricted />;
    }

    if (!tabConfig) {
      return <WelcomePage />;
    }

    return <TabContentRenderer config={tabConfig} userName={userName ?? ''} greeting={greeting} />;
  },
);
