import type {
  CreateTicketFormData,
  CursorPage,
  Ticket,
  TicketAttachment,
  UpdateTicketFormData,
} from '@/types';
import { apiClient } from '@/shared/api';
import {
  normalizeApiModuleError,
  normalizeCursorPageContract,
  parseApiPayload,
  parseEntityOrApiResponse,
  ticketAttachmentUploadResponseSchema,
  ticketSchema,
  ticketStatsOfMonthSchema,
  userTicketStatsSchema,
} from '@/shared/api/contracts';

// ============ Types ============

export interface TicketStatsOfMonth {
  stats: Array<{
    month: string;
    monthNumber: number;
    count: number;
    year: number;
  }>;
  currentMonth: number;
  currentYear: number;
}

export interface UserTicketStats {
  stats: Array<{
    count: number;
    year: number;
    monthNumber: number;
    month: string;
  }>;
  period: string;
  userId: number;
}

export type TicketScope = 'all' | 'mine' | 'assignedToMe' | undefined;
export type TicketDateFilter = 'today';

export interface TicketListParams {
  cursor?: string | null;
  limit?: number;
  scope?: TicketScope;
  status?: string[] | string;
  date?: TicketDateFilter;
  includeUnassigned?: boolean;
}

export type TicketListResponse = CursorPage<Ticket>;

export const DEFAULT_TICKET_PAGE_SIZE = 20;

const buildTicketListEndpoint = (basePath: string, params: TicketListParams = {}) => {
  const searchParams = new URLSearchParams();
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.scope) searchParams.set('scope', params.scope);
  if (params.date) searchParams.set('date', params.date);
  if (params.includeUnassigned) searchParams.set('includeUnassigned', 'true');

  const statusValues = Array.isArray(params.status) ? params.status : params.status?.split(',');
  const normalizedStatus = statusValues
    ?.map((status) => status.trim())
    .filter(Boolean)
    .join(',');
  if (normalizedStatus) searchParams.set('status', normalizedStatus);

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
};

// ============ API Functions ============

export const getUserTickets = async (
  params: TicketListParams = {},
): Promise<TicketListResponse> => {
  try {
    const endpoint = buildTicketListEndpoint('/tickets', {
      limit: DEFAULT_TICKET_PAGE_SIZE,
      ...params,
      scope: 'mine',
    });
    const response = await apiClient.get<unknown>(endpoint);
    return normalizeCursorPageContract(
      response,
      ticketSchema,
      params.limit ?? DEFAULT_TICKET_PAGE_SIZE,
      endpoint,
    );
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch user tickets');
  }
};

export const getTicketStatsOfMonth = async (): Promise<TicketStatsOfMonth> => {
  try {
    const response = await apiClient.get<unknown>('/tickets/stats');
    return parseApiPayload(ticketStatsOfMonthSchema, response, { endpoint: '/tickets/stats' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch ticket stats');
  }
};

export const getUserTicketStats = async (): Promise<UserTicketStats> => {
  try {
    const response = await apiClient.get<unknown>('/tickets/user/stats');
    return parseApiPayload(userTicketStatsSchema, response, { endpoint: '/tickets/user/stats' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch user ticket stats');
  }
};

export const getAllTickets = async (params: TicketListParams = {}): Promise<TicketListResponse> => {
  try {
    const endpoint = buildTicketListEndpoint('/tickets', {
      limit: DEFAULT_TICKET_PAGE_SIZE,
      ...params,
      scope: 'all',
    });
    const response = await apiClient.get<unknown>(endpoint);
    return normalizeCursorPageContract(
      response,
      ticketSchema,
      params.limit ?? DEFAULT_TICKET_PAGE_SIZE,
      endpoint,
    );
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch all tickets');
  }
};

export const getTickets = async (params: TicketListParams = {}): Promise<TicketListResponse> => {
  try {
    const endpoint = buildTicketListEndpoint('/tickets', {
      limit: DEFAULT_TICKET_PAGE_SIZE,
      ...params,
    });
    const response = await apiClient.get<unknown>(endpoint);
    return normalizeCursorPageContract(
      response,
      ticketSchema,
      params.limit ?? DEFAULT_TICKET_PAGE_SIZE,
      endpoint,
    );
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch tickets');
  }
};

export const getTicketById = async (ticketId: string): Promise<Ticket> => {
  try {
    const endpoint = `/tickets/${ticketId}`;
    const response = await apiClient.get<unknown>(endpoint);
    return parseApiPayload(ticketSchema, response, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch ticket details');
  }
};

export const createTicket = async (ticketData: CreateTicketFormData): Promise<Ticket> => {
  try {
    const response = await apiClient.post<unknown>('/tickets', ticketData);
    return parseEntityOrApiResponse(response, ticketSchema, { endpoint: '/tickets' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to create ticket');
  }
};

export const updateTicket = async (
  ticketId: string,
  updatedData: UpdateTicketFormData,
): Promise<Ticket> => {
  try {
    const endpoint = `/tickets/${ticketId}`;
    const response = await apiClient.put<unknown>(endpoint, updatedData);
    return parseEntityOrApiResponse(response, ticketSchema, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to update ticket');
  }
};

export const addComment = async (ticketId: string, content: string): Promise<Ticket> => {
  try {
    const endpoint = `/tickets/${ticketId}/comments`;
    const response = await apiClient.post<unknown>(endpoint, {
      content,
    });
    return parseEntityOrApiResponse(response, ticketSchema, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to add comment');
  }
};

export const uploadTicketAttachment = async (
  ticketId: string,
  file: File,
): Promise<{ success: boolean; attachments: TicketAttachment[] }> => {
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const endpoint = `/tickets/${ticketId}/attachments`;
    const response = await apiClient.upload<unknown>(endpoint, formData);
    return parseApiPayload(ticketAttachmentUploadResponseSchema, response, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to upload ticket attachment');
  }
};
