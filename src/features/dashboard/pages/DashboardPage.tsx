import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TabType } from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { useGreeting } from '../hooks/useGreeting';
import { DashboardTabContent } from '@/features/dashboard/components/DashboardTabContent';

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { role, userName } = useAuth();
  const greeting = useGreeting().greeting;
  const [searchQuery] = useState<string>('');

  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'dashboard';

  return (
    <DashboardTabContent
      currentTab={currentTab}
      greeting={greeting}
      userName={userName ?? null}
      searchQuery={searchQuery}
      role={role ?? null}
    />
  );
};

export default DashboardPage;
