import React from 'react';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';
import { AllTickets } from '@/features/tickets/pages/AllTickets';
import { CreateTicket } from '@/features/tickets/pages/CreateTicket';
import { MyTickets } from '@/features/tickets/pages/MyTickets';
import Analytics from '@/features/dashboard/pages/Analytics';
import type { TabType } from '@/types';

interface DashboardTabContentProps {
  currentTab: TabType;
  greeting: string;
  userName: string | null;
  searchQuery: string;
  role: string | null;
}

export const DashboardTabContent: React.FC<DashboardTabContentProps> = ({
  currentTab,
  greeting,
  userName,
  searchQuery,
  role,
}) => {
  switch (currentTab) {
    case 'dashboard':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">
              {greeting}, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Welcome back. Here's an overview of your support tickets.
            </p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <DashboardContent role={role} />
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
            <DashboardContent role={role} />
          </div>
        </div>
      );
    case 'my-tickets':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">My Tickets</h1>
            <p className="text-muted-foreground">Manage and track your support tickets</p>
          </div>
          <div className="p-4 lg:p-6">
            <MyTickets searchQuery={searchQuery} role={role} />
          </div>
        </div>
      );
    case 'all-tickets':
      return (
        <div className="@container/main flex-1 overflow-auto">
          <div className="border-b px-4 py-6 lg:px-6">
            <h1 className="text-2xl font-semibold">All Tickets</h1>
            <p className="text-muted-foreground">View and manage all support tickets</p>
          </div>
          <div className="px-4 py-6 lg:px-6">
            <AllTickets searchQuery={searchQuery} role={role} />
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
            <CreateTicket role={role} />
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
