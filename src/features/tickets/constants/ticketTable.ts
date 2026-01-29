import type { ReactNode } from 'react';
import type { Ticket, UserRole } from '@/types';

export interface TicketColumnRenderContext {
  ticket: Ticket;
  role?: UserRole | null;
  onTicketClick?: (ticketId: string) => void;
  onUserClick?: (userId: string) => void;
}

export interface TicketTableColumn {
  key: string;
  title: string;
  className?: string;
  render: (context: TicketColumnRenderContext) => ReactNode;
}

// Re-export simple headers for backward compatibility
export const TICKET_TABLE_HEADERS = [
  { title: 'Ticket ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Owner', key: 'owner' },
  { title: 'Priority', key: 'priority' },
  { title: 'Status', key: 'status' },
  { title: 'Assignee', key: 'assignee' },
  { title: 'Created', key: 'created' },
] as const;

export type TicketTableHeader = (typeof TICKET_TABLE_HEADERS)[number];
