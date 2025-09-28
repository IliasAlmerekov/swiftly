import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TabType } from '@/types';
import { DashboardTabContent } from '@/features/dashboard/components/DashboardTabContent';

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'dashboard';

  return <DashboardTabContent currentTab={currentTab} />;
};

export default DashboardPage;
