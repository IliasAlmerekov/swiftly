/* eslint-disable react-refresh/only-export-components -- contract file exports provider and hooks by design */
import { useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGreeting } from '@/features/dashboard';
import { useAuth } from '@/shared/hooks/useAuth';
import { createStrictContext } from '@/shared/lib/createStrictContext';
import { useDashboardData } from '@/app/hooks/useDashboardData';

export interface DashboardPageContract {
  useSearchParams: typeof useSearchParams;
  useNavigate: typeof useNavigate;
  useAuth: typeof useAuth;
  useGreeting: typeof useGreeting;
  useDashboardData: typeof useDashboardData;
}

const defaultDashboardPageContract: DashboardPageContract = {
  useSearchParams,
  useNavigate,
  useAuth,
  useGreeting,
  useDashboardData,
};

const [DashboardPageContractContext, useDashboardPageContract] =
  createStrictContext<DashboardPageContract>({
    contextName: 'DashboardPageContractContext',
    errorMessage: 'useDashboardPageContract must be used within a DashboardPageContractProvider',
  });

interface DashboardPageContractProviderProps {
  children: ReactNode;
  contract?: DashboardPageContract;
}

export const DashboardPageContractProvider = ({
  children,
  contract,
}: DashboardPageContractProviderProps) => {
  const value = useMemo(() => contract ?? defaultDashboardPageContract, [contract]);

  return (
    <DashboardPageContractContext.Provider value={value}>
      {children}
    </DashboardPageContractContext.Provider>
  );
};

export { useDashboardPageContract };
