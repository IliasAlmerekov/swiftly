import React, { useMemo } from 'react';
import { LayoutDashboard, Ticket, HelpCircle, BarChart3 } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/shared/components/ui/sidebar';
import { NavUser } from './nav-user';
import type { TabType, UserRole } from '@/types';

// Import logo
import SwiftlyLogo from '@/assets/sidebarLogo.png';

// Menu configuration
const MENU_CONFIG = {
  user: [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets' as const, label: 'Tickets', icon: Ticket },
    { id: 'create-ticket' as const, label: 'Support', icon: HelpCircle },
  ],
  support1: [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets' as const, label: 'Tickets', icon: Ticket },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'create-ticket' as const, label: 'Support', icon: HelpCircle },
  ],
  admin: [
    {
      id: 'admin-dashboard' as const,
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
    },
    { id: 'tickets' as const, label: 'Tickets', icon: Ticket },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'create-ticket' as const, label: 'Support', icon: HelpCircle },
  ],
};

interface MenuItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: UserRole | null;
  email: string | null;
  currentTab: TabType;
  onTabChange: (tabId: TabType) => void;
  onSearch?: (query: string) => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ role, email, currentTab, onTabChange }) => {
  // Determine menu based on role
  const getMenuForRole = (role: SidebarProps['role']): MenuItem[] => {
    if (role === 'admin') {
      return MENU_CONFIG.admin;
    }
    if (role === 'support1') {
      return MENU_CONFIG.support1;
    }
    return MENU_CONFIG.user;
  };

  const menuItems: MenuItem[] = useMemo(() => {
    return getMenuForRole(role);
  }, [role]);

  const handleTabChange = (tabId: TabType) => {
    if (tabId === currentTab) return; // No action if the same tab is selected
    onTabChange(tabId);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={SwiftlyLogo} alt="Swiftly" className="h-8 w-8 rounded-sm" />
          <div className="flex">
            <h1 className="text-lg font-semibold">Swiftly</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-6 pl-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const IconComponent = item.icon;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleTabChange(item.id)}
                  isActive={isActive}
                  className="h-11"
                >
                  <IconComponent className="h-5 w-5" />
                  <span className={item.id === 'create-ticket' ? 'font-semibold' : ''}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
          <NavUser
            user={{
              name: email || 'Unknown User',
              email: email || undefined,
            }}
          />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
