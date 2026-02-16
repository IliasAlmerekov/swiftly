import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { paths } from '@/config/paths';
import { SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar';
import AppSidebar from '@/shared/components/layout/Sidebar';
import { useAuth } from '@/shared/hooks/useAuth';
import type { TabType } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentTab?: TabType;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = 'HelpDesk', currentTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, email } = useAuth();
  const [currentSidebarTab, setCurrentSidebarTab] = useState<TabType>('dashboard');

  // Determine current tab based on URL if not explicitly provided
  useEffect(() => {
    if (currentTab) {
      setCurrentSidebarTab(currentTab);
    } else {
      // Auto-detect tab from current URL
      const path = location.pathname;
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');

      if (path.includes('/tickets/')) {
        if (tabParam === paths.tabs.tickets) {
          setCurrentSidebarTab(tabParam as TabType);
        } else {
          setCurrentSidebarTab(paths.tabs.tickets);
        }
      } else if (path === paths.app.dashboard.path) {
        if (tabParam) {
          setCurrentSidebarTab(tabParam as TabType);
        } else {
          setCurrentSidebarTab('dashboard');
        }
      } else {
        setCurrentSidebarTab('dashboard');
      }
    }
  }, [currentTab, location.pathname, location.search]);

  // Authentication is handled by useAuth hook

  const handleTabChange = (tabId: TabType) => {
    setCurrentSidebarTab(tabId);

    // Navigate based on tab selection
    switch (tabId) {
      case 'dashboard':
      case 'admin-dashboard':
        navigate(paths.app.dashboard.getHref(tabId));
        break;
      case 'tickets':
        navigate(paths.app.dashboard.getHref(paths.tabs.tickets));
        break;
      case 'create-ticket':
        navigate(paths.app.dashboard.getHref(paths.tabs.createTicket));
        break;
      case 'analytics':
        navigate(paths.app.dashboard.getHref(paths.tabs.analytics));
        break;
      case 'user-profile':
        navigate(paths.app.profile.getHref());
        break;
      default:
        navigate(paths.app.dashboard.getHref());
        break;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          role={role}
          email={email}
          currentTab={currentSidebarTab}
          onTabChange={handleTabChange}
        />
        <main className="@container/main flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          </header>
          <div className="@container/main flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
