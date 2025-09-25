import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import AppSidebar from "@/shared/components/layout/Sidebar";
import { useAuth } from "@/shared/hooks/useAuth";
import type { TabType } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentTab?: TabType;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = "HelpDesk",
  currentTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, email } = useAuth();
  const [currentSidebarTab, setCurrentSidebarTab] =
    useState<TabType>("dashboard");

  // Determine current tab based on URL if not explicitly provided
  useEffect(() => {
    if (currentTab) {
      setCurrentSidebarTab(currentTab);
    } else {
      // Auto-detect tab from current URL
      const path = location.pathname;
      const params = new URLSearchParams(location.search);
      const tabParam = params.get("tab");

      if (path.includes("/tickets/")) {
        setCurrentSidebarTab("my-tickets");
      } else if (path === "/dashboard") {
        if (tabParam) {
          setCurrentSidebarTab(tabParam as TabType);
        } else {
          setCurrentSidebarTab("dashboard");
        }
      } else {
        setCurrentSidebarTab("dashboard");
      }
    }
  }, [currentTab, location.pathname, location.search]);

  // Authentication is handled by useAuth hook

  const handleTabChange = (tabId: TabType) => {
    setCurrentSidebarTab(tabId);

    // Navigate based on tab selection
    switch (tabId) {
      case "dashboard":
      case "admin-dashboard":
        navigate("/dashboard?tab=dashboard");
        break;
      case "my-tickets":
        navigate("/dashboard?tab=my-tickets");
        break;
      case "all-tickets":
        navigate("/dashboard?tab=all-tickets");
        break;
      case "create-ticket":
        navigate("/dashboard?tab=create-ticket");
        break;
      case "analytics":
        navigate("/dashboard?tab=analytics");
        break;
      case "user-profile":
        navigate("/user-profile");
        break;
      default:
        navigate("/dashboard");
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
        <main className="@container/main flex-1 flex flex-col overflow-hidden">
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
