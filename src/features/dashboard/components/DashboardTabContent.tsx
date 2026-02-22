import React, { memo, useMemo } from 'react';
import type { TabType } from '@/types';
import { TabPageLayout } from '@/shared/components/layout/TabPageLayout';
import type { DashboardTabComponents, DashboardTabRuntime } from '../types/dashboard';

interface DashboardTabContentProps extends DashboardTabRuntime {
  currentTab: TabType;
  components: DashboardTabComponents;
}

interface TabConfig {
  title: string | ((userName: string, greeting: string) => React.ReactNode);
  subtitle: string;
  component: React.ComponentType;
  staffOnly?: boolean;
  contentClassName?: string;
}

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

const WelcomePage = memo(function WelcomePage() {
  return (
    <TabPageLayout title="Welcome" subtitle="Select an option from the sidebar to get started">
      <div />
    </TabPageLayout>
  );
});

const STAFF_ONLY_TABS: TabType[] = ['admin-dashboard', 'analytics'];

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

  const resolvedTitle = typeof title === 'function' ? title(userName, greeting) : title;

  return (
    <TabPageLayout title={resolvedTitle} subtitle={subtitle} contentClassName={contentClassName}>
      <Component />
    </TabPageLayout>
  );
});

export const DashboardTabContent: React.FC<DashboardTabContentProps> = memo(
  function DashboardTabContent({ currentTab, components, role, userName, greeting }) {
    const isStaff = role === 'admin' || role === 'support1';

    const tabConfig = useMemo<Partial<Record<TabType, TabConfig>>>(
      () => ({
        dashboard: {
          title: (resolvedUserName, resolvedGreeting) => (
            <h1 className="text-2xl font-semibold">
              {resolvedGreeting}, {resolvedUserName}!
            </h1>
          ),
          subtitle: "Welcome back. Here's an overview of your support tickets.",
          component: components.dashboard,
        },
        'admin-dashboard': {
          title: (resolvedUserName, resolvedGreeting) => (
            <>
              <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
              <h2 className="text-2xl font-semibold">
                {resolvedGreeting}, {resolvedUserName}!
              </h2>
            </>
          ),
          subtitle: 'Administrative overview and controls',
          component: components.dashboard,
          staffOnly: true,
        },
        tickets: {
          title: 'Tickets',
          subtitle: 'View and manage support tickets',
          component: components.tickets,
        },
        'create-ticket': {
          title: 'Create New Ticket',
          subtitle: 'Submit a new support request',
          component: components.createTicket,
          contentClassName: 'p-4 lg:p-6',
        },
        analytics: {
          title: 'Analytics',
          subtitle: 'Performance metrics and detailed reports',
          component: components.analytics,
          staffOnly: true,
        },
      }),
      [components],
    );

    const hasAccess = !STAFF_ONLY_TABS.includes(currentTab) || isStaff;

    if (!hasAccess) {
      return <AccessRestricted />;
    }

    if (!tabConfig[currentTab]) {
      return <WelcomePage />;
    }

    return (
      <TabContentRenderer
        config={tabConfig[currentTab] as TabConfig}
        userName={userName}
        greeting={greeting}
      />
    );
  },
);
