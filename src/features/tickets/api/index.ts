import type {
  ApiResponse,
  CreateTicketFormData,
  CursorPage,
  Ticket,
  UpdateTicketFormData,
} from '@/types';
import { ApiError } from '@/types';
import { apiClient } from '@/shared/api';

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

export interface TicketListParams {
  cursor?: string | null;
  limit?: number;
}

export type TicketListResponse = CursorPage<Ticket>;

export const DEFAULT_TICKET_PAGE_SIZE = 20;

const buildTicketListEndpoint = (basePath: string, params: TicketListParams = {}) => {
  const searchParams = new URLSearchParams();
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
};

const normalizeTicketListResponse = (
  data: TicketListResponse | null | undefined,
  fallbackLimit: number,
): TicketListResponse => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const pageInfo = data?.pageInfo ?? {
    limit: fallbackLimit,
    hasNextPage: false,
    nextCursor: null,
  };

  return {
    items,
    pageInfo: {
      limit: pageInfo.limit ?? fallbackLimit,
      hasNextPage: Boolean(pageInfo.hasNextPage),
      nextCursor: pageInfo.nextCursor ?? null,
    },
  };
};

// ============ API Functions ============

export const getUserTickets = async (
  params: TicketListParams = {},
): Promise<TicketListResponse> => {
  try {
    const endpoint = buildTicketListEndpoint('/tickets/user', {
      limit: DEFAULT_TICKET_PAGE_SIZE,
      ...params,
    });
    const data = await apiClient.get<TicketListResponse>(endpoint);
    return normalizeTicketListResponse(data, params.limit ?? DEFAULT_TICKET_PAGE_SIZE);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user tickets', 500);
  }
};

export const getTicketStatsOfMonth = async (): Promise<TicketStatsOfMonth> => {
  try {
    return await apiClient.get<TicketStatsOfMonth>('/tickets/stats');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch ticket stats', 500);
  }
};

export const getUserTicketStats = async (): Promise<UserTicketStats> => {
  try {
    return await apiClient.get<UserTicketStats>('/tickets/user/stats');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user ticket stats', 500);
  }
};

export const getAllTickets = async (params: TicketListParams = {}): Promise<TicketListResponse> => {
  try {
    const endpoint = buildTicketListEndpoint('/tickets', {
      limit: DEFAULT_TICKET_PAGE_SIZE,
      ...params,
    });
    const data = await apiClient.get<TicketListResponse>(endpoint);
    return normalizeTicketListResponse(data, params.limit ?? DEFAULT_TICKET_PAGE_SIZE);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch all tickets', 500);
  }
};

export const getTicketById = async (ticketId: string): Promise<Ticket> => {
  try {
    return await apiClient.get<Ticket>(`/tickets/${ticketId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch ticket details', 500);
  }
};

export const createTicket = async (ticketData: CreateTicketFormData): Promise<Ticket> => {
  try {
    const data = await apiClient.post<ApiResponse<Ticket>>('/tickets', ticketData);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create ticket', 500);
  }
};

export const updateTicket = async (
  ticketId: string,
  updatedData: UpdateTicketFormData,
): Promise<Ticket> => {
  try {
    const data = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${ticketId}`, updatedData);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update ticket', 500);
  }
};

export const addComment = async (ticketId: string, content: string): Promise<Ticket> => {
  try {
    const data = await apiClient.post<ApiResponse<Ticket>>(`/tickets/${ticketId}/comments`, {
      content,
    });
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to add comment', 500);
  }
};

export const uploadTicketAttachment = async (
  ticketId: string,
  file: File,
): Promise<ApiResponse<Ticket>> => {
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return await apiClient.upload<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/attachments`,
      formData,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload ticket attachment', 500);
  }
};
