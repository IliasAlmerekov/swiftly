import React from 'react';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';
import { CreateTicket } from '@/features/tickets/pages/CreateTicket';
import { Tickets } from '@/features/tickets/pages/Tickets';
import Analytics from '@/features/dashboard/pages/Analytics';
import type { TabType } from '@/types';
import { useGreeting } from '../hooks/useGreeting';
import { useAuth } from '@/shared/hooks/useAuth';

interface DashboardTabContentProps {
  currentTab: TabType;
}

export const DashboardTabContent: React.FC<DashboardTabContentProps> = ({ currentTab }) => {
  const greeting = useGreeting().greeting;
  const { userName, role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';
  const staffOnlyTabs: TabType[] = ['admin-dashboard', 'analytics'];

  if (staffOnlyTabs.includes(currentTab) && !isStaff) {
    return (
      <div className="@container/main flex-1 overflow-auto">
        <div className="border-b px-4 py-6 lg:px-6">
          <h1 className="text-2xl font-semibold">Access Restricted</h1>
          <p className="text-muted-foreground">You do not have permission to view this section.</p>
        </div>
      </div>
    );
  }

  switch (currentTab) {
    case 'dashboard':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">
              {greeting}, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Welcome back. Here&apos;s an overview of your support tickets.
            </p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <DashboardContent />
          </div>
        </div>
      );
    case 'admin-dashboard':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
            <h2 className="text-2xl font-semibold">
              {greeting}, {userName}!
            </h2>
            <p className="text-muted-foreground">Administrative overview and controls</p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <DashboardContent />
          </div>
        </div>
      );
    case 'tickets':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">Tickets</h1>
            <p className="text-muted-foreground">View and manage support tickets</p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <Tickets />
          </div>
        </div>
      );
    case 'create-ticket':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">Create New Ticket</h1>
            <p className="text-muted-foreground">Submit a new support request</p>
          </div>
          <div className="p-4 lg:p-6">
            <CreateTicket />
          </div>
        </div>
      );
    case 'analytics':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground">Performance metrics and detailed reports</p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <Analytics />
          </div>
        </div>
      );
    default:
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p className="text-muted-foreground">
              Select an option from the sidebar to get started
            </p>
          </div>
        </div>
      );
  }
};
