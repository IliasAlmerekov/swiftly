/**
 * Centralized path configuration for the application.
 * Following bulletproof-react pattern for route management.
 *
 * Each path has:
 * - path: The route path pattern (for router configuration)
 * - getHref: Function to generate the actual URL (for navigation)
 */
export const paths = {
  // ============ Home ============
  home: {
    path: '/',
    getHref: () => '/',
  },

  // ============ Auth Routes ============
  auth: {
    login: {
      path: '/login',
      getHref: () => '/login',
    },
    register: {
      path: '/register',
      getHref: () => '/register',
    },
  },

  // ============ App Routes ============
  app: {
    dashboard: {
      path: '/dashboard',
      getHref: (tab?: string) => (tab ? `/dashboard?tab=${tab}` : '/dashboard'),
    },
    ticket: {
      path: '/tickets/:ticketId',
      getHref: (ticketId: string, tab?: string) =>
        tab ? `/tickets/${ticketId}?tab=${tab}` : `/tickets/${ticketId}`,
    },
    user: {
      path: '/users/:userId',
      getHref: (userId: string) => `/users/${userId}`,
    },
    profile: {
      path: '/user-profile',
      getHref: () => '/user-profile',
    },
  },

  // ============ Dashboard Tabs ============
  tabs: {
    dashboard: 'dashboard',
    tickets: 'tickets',
    createTicket: 'create-ticket',
    analytics: 'analytics',
  },
} as const;

// Type for dashboard tabs
export type DashboardTab = (typeof paths.tabs)[keyof typeof paths.tabs];
