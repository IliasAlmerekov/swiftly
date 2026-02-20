// Tickets Feature - Public API
// Only exports that should be used by other parts of the app

// Pages (for router)
export { CreateTicket } from './pages/CreateTicket';
export { Tickets } from './pages/Tickets';
export { default as TicketDetailPage } from './pages/TicketDetailPage';

// Components (for dashboard feature)
export { TicketTable } from './components/TicketTable';
export { TicketRow } from './components/TicketRow';
export { TicketStats } from './components/TicketStats';
export { TicketSearchBar } from './components/TicketSearchBar';

// Config
export { TICKET_COLUMNS } from './config/ticketColumns';
export type { TicketTableColumn, TicketColumnRenderContext } from './constants/ticketTable';

// API
export * from './api';
export * from './api/ai';

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
