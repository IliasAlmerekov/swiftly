import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TabType, Ticket } from "@/types";
import { ApiError } from "@/types";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getAllTickets,
  getUserTickets,
  getSupportUsers,
  setUserStatusOnline,
  activityInterval,
} from "@/api/api";
import { useGreeting } from "../hooks/useGreeting";
import { DashboardTabContent } from "@/features/dashboard/components/DashboardTabContent";

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { role, userName } = useAuth();
  const greeting = useGreeting().greeting;
  const [supportUsers, setSupportUsers] = useState<number>(0);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [ticketsToday, setTicketsToday] = useState<number>(0);
  const [searchQuery] = useState<string>("");
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentTab: TabType =
    (searchParams.get("tab") as TabType) || "dashboard";

  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingTickets(true);
      setError(null);
      try {
        const tickets = await getUserTickets();
        setUserTickets(tickets);
        const allTickets = role === "admin" ? await getAllTickets() : [];
        setAllTickets(allTickets);
      } catch (error) {
        setError("Failed to load tickets");
        console.error("Error fetching tickets:", error);

        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoadingTickets(false);
      }
    };

    if (role) {
      fetchTickets();
    }
  }, [role]);

  useEffect(() => {
    const fetchUserTicketsToday = async () => {
      try {
        const tickets = await getUserTickets();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTickets = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.createdAt);
          ticketDate.setHours(0, 0, 0, 0);
          return ticketDate.getTime() === today.getTime();
        });
        setTicketsToday(todayTickets.length);
      } catch (error) {
        console.error("Failed to fetch user's tickets today:", error);
      }
    };

    const fetchSupportUsers = async () => {
      try {
        const response = await getSupportUsers();
        setSupportUsers(response.onlineCount || 0);
        setTotalAdmins(response.totalCount || 0);
      } catch (error) {
        console.error("Failed to fetch support users:", error);
      }
    };

    fetchUserTicketsToday();
    fetchSupportUsers();
    setUserStatusOnline();

    const activeInterval = setInterval(() => {
      activityInterval();
    }, 2 * 60 * 1000);

    const supportUsersInterval = setInterval(() => {
      fetchSupportUsers();
    }, 30 * 1000);

    return () => {
      clearInterval(activeInterval);
      clearInterval(supportUsersInterval);
    };
  }, []);

  return (
    <DashboardTabContent
      currentTab={currentTab}
      greeting={greeting}
      userName={userName ?? null}
      userTickets={userTickets}
      allTickets={allTickets}
      supportUsers={supportUsers}
      totalAdmins={totalAdmins}
      ticketsToday={ticketsToday}
      loading={loadingTickets}
      error={error}
      searchQuery={searchQuery}
      role={role ?? null}
    />
  );
};

export default DashboardPage;
