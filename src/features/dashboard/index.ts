// Dashboard Feature - Public API
// Only exports that should be used by other parts of the app

// Pages (for router)
export { default as DashboardPage } from './pages/DashboardPage';
export { default as Analytics } from './pages/Analytics';

// Components (named exports)
export { DashboardContent } from './components/DashboardContent';
export { DashboardTabContent } from './components/DashboardTabContent';

// Components (default exports)
export { default as RecentTickets } from './components/RecentTickets';
export { default as AdminTicketCard } from './components/AdminTicketCard';
export { default as UserTicketCard } from './components/UserTicketCard';
export { default as ViewSupportStatus } from './components/ViewSupportStatus';

// Hooks
export { useGreeting } from './hooks/useGreeting';
