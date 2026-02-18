import { useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TicketScope, TicketDateFilter } from '@/features/tickets/api';

// ============ Types ============
export interface StaffTab {
  value: string;
  label: string;
  scope: TicketScope;
  status?: string[];
  date?: TicketDateFilter;
  includeUnassigned?: boolean;
}

interface UserStatusOption {
  value: string;
  label: string;
  status?: string[];
}

export interface QueryFilters {
  scope: TicketScope;
  status?: string[];
  date?: TicketDateFilter;
  includeUnassigned?: boolean;
}

// ============ Constants ============
export const USER_STATUS_OPTIONS: UserStatusOption[] = [
  { value: 'all', label: 'All tickets', status: undefined },
  { value: 'open', label: 'Open', status: ['open'] },
  { value: 'in-progress', label: 'In progress', status: ['in-progress'] },
  { value: 'closed', label: 'Closed', status: ['closed', 'resolved'] },
];

export const USER_STATUS_SELECT_OPTIONS = USER_STATUS_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

export const STAFF_TABS: StaffTab[] = [
  {
    value: 'assigned',
    label: 'My in progress',
    scope: 'assignedToMe',
    includeUnassigned: true,
  },
  { value: 'all', label: 'All tickets', scope: 'all' },
  { value: 'open', label: 'All open', scope: 'all', status: ['open'] },
  { value: 'in-progress', label: 'All in progress', scope: 'all', status: ['in-progress'] },
  { value: 'today', label: "Today's tickets", scope: 'all', date: 'today' },
  { value: 'closed', label: 'Closed', scope: 'all', status: ['closed', 'resolved'] },
];

// ============ Hook ============
interface UseTicketFiltersOptions {
  isStaff: boolean;
}

interface UseTicketFiltersResult {
  /** Current filter value from URL */
  activeFilterValue: string;
  /** Active staff tab configuration */
  activeStaffTab: StaffTab;
  /** Active user filter configuration */
  activeUserFilter: UserStatusOption;
  /** Computed query filters for API */
  queryFilters: QueryFilters;
  /** Key for resetting pagination */
  filterKey: string;
  /** Handler for filter value change */
  onFilterChange: (value: string) => void;
}

/**
 * Custom hook for managing ticket filter state.
 * Centralizes filter logic to simplify the Tickets page component.
 */
export function useTicketFilters({ isStaff }: UseTicketFiltersOptions): UseTicketFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const resolveFilterValue = useCallback((value: string | null, staffMode: boolean): string => {
    if (staffMode) {
      return value !== null && STAFF_TABS.some((tab) => tab.value === value)
        ? value
        : STAFF_TABS[1].value;
    }
    return value !== null && USER_STATUS_OPTIONS.some((option) => option.value === value)
      ? value
      : USER_STATUS_OPTIONS[0].value;
  }, []);

  const activeFilterValue = useMemo(
    () => resolveFilterValue(searchParams.get('filter'), isStaff),
    [isStaff, resolveFilterValue, searchParams],
  );

  const activeTabValue = useMemo(
    () => resolveFilterValue(searchParams.get('filter'), true),
    [resolveFilterValue, searchParams],
  );

  // Sync URL with filter value
  useEffect(() => {
    const current = searchParams.get('filter');
    if (current === activeFilterValue) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filter', activeFilterValue);
    setSearchParams(nextParams, { replace: true });
  }, [activeFilterValue, searchParams, setSearchParams]);

  const activeStaffTab = useMemo(
    () => STAFF_TABS.find((tab) => tab.value === activeTabValue) ?? STAFF_TABS[1],
    [activeTabValue],
  );

  const activeUserFilter = useMemo(
    () =>
      USER_STATUS_OPTIONS.find((option) => option.value === activeFilterValue) ??
      USER_STATUS_OPTIONS[0],
    [activeFilterValue],
  );

  const queryFilters = useMemo((): QueryFilters => {
    if (isStaff) {
      return {
        scope: activeStaffTab.scope,
        status: activeStaffTab.status,
        date: activeStaffTab.date,
        includeUnassigned: activeStaffTab.includeUnassigned,
      };
    }
    return {
      scope: 'mine',
      status: activeUserFilter.status,
    };
  }, [activeStaffTab, activeUserFilter, isStaff]);

  const filterKey = useMemo(() => {
    const statusKey = queryFilters.status ? queryFilters.status.join(',') : 'all';
    return `${queryFilters.scope}-${statusKey}-${queryFilters.date ?? 'any'}-${
      queryFilters.includeUnassigned ? 'with-unassigned' : 'assigned-only'
    }`;
  }, [queryFilters]);

  const onFilterChange = useCallback(
    (value: string) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('filter', value);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  return {
    activeFilterValue,
    activeStaffTab,
    activeUserFilter,
    queryFilters,
    filterKey,
    onFilterChange,
  };
}
