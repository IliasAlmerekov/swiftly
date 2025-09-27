import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TabType, Ticket } from '@/types';
import { ApiError } from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { getAllTickets, getUserTickets } from '@/api/api';
import { useGreeting } from '../hooks/useGreeting';
import { DashboardTabContent } from '@/features/dashboard/components/DashboardTabContent';

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { role, userName } = useAuth();
  const greeting = useGreeting().greeting;
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [searchQuery] = useState<string>('');
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'dashboard';

  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingTickets(true);
      setError(null);
      try {
        const tickets = await getUserTickets();
        setUserTickets(tickets);
        const allTickets = role === 'admin' ? await getAllTickets() : [];
        setAllTickets(allTickets);
      } catch (error) {
        setError('Failed to load tickets');
        console.error('Error fetching tickets:', error);

        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoadingTickets(false);
      }
    };

    if (role) {
      fetchTickets();
    }
  }, [role]);

  return (
    <DashboardTabContent
      currentTab={currentTab}
      greeting={greeting}
      userName={userName ?? null}
      userTickets={userTickets}
      allTickets={allTickets}
      loading={loadingTickets}
      error={error}
      searchQuery={searchQuery}
      role={role ?? null}
    />
  );
};

export default DashboardPage;
