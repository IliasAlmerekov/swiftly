// Tickets Feature - Public API
// Only exports that should be used by other parts of the app

// Pages (for router)
export { AllTickets } from './pages/AllTickets';
export { CreateTicket } from './pages/CreateTicket';
export { MyTickets } from './pages/MyTickets';
export { default as TicketDetailPage } from './pages/TicketDetailPage';

// Components (for dashboard feature)
export { TicketTable } from './components/TicketTable';
export { TicketStats } from './components/TicketStats';
export { TicketSearchBar } from './components/TicketSearchBar';

// API
export * from './api';

// React Query Hooks
export {
  ticketKeys,
  useUserTickets,
  useAllTickets,
  useTicket,
  useTicketStats,
  useUserTicketStats,
  useCreateTicket,
  useUpdateTicket,
  useAddComment,
  useUploadAttachment,
} from './hooks/useTickets';

// Utils
export * from './utils/ticketUtils';
