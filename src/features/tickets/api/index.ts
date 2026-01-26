import type { ApiResponse, CreateTicketFormData, Ticket, UpdateTicketFormData } from '@/types';
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

// ============ API Functions ============

export const getUserTickets = async (): Promise<Ticket[]> => {
  try {
    const data = await apiClient.get<Ticket[]>('/tickets/user');
    return Array.isArray(data) ? data : [];
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

export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const data = await apiClient.get<Ticket[]>('/tickets');
    return Array.isArray(data) ? data : [];
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
