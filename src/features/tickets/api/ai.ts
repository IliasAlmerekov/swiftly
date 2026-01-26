import type { ApiResponse, AIResponse, ChatRequest, SolutionSearchResult } from '@/types';
import { ApiError } from '@/types';
import { apiClient } from '@/shared/api';

// ============ Chat ============

export const sendChatMessage = async (data: ChatRequest): Promise<ApiResponse<AIResponse>> => {
  return apiClient.post<ApiResponse<AIResponse>>('/ai/chat', data);
};

// ============ Solutions ============

export const searchSolutions = async (
  query: string,
): Promise<ApiResponse<SolutionSearchResult[]>> => {
  return apiClient.get<ApiResponse<SolutionSearchResult[]>>(
    `/ai/solutions/search?query=${encodeURIComponent(query)}`,
  );
};

export const getTicketSuggestions = async (ticketId: string): Promise<ApiResponse<AIResponse>> => {
  return apiClient.get<ApiResponse<AIResponse>>(`/ai/tickets/${ticketId}/suggestions`);
};

export const generateSolution = async (ticketId: string): Promise<ApiResponse<AIResponse>> => {
  return apiClient.post<ApiResponse<AIResponse>>(`/ai/tickets/${ticketId}/solution`);
};

// ============ Feedback ============

export const submitAIFeedback = async (
  sessionId: string,
  isHelpful: boolean,
  feedback?: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.post<ApiResponse<{ message: string }>>('/ai/feedback', {
    sessionId,
    isHelpful,
    feedback,
  });
};

// ============ Stats ============

export const getAIStats = async () => {
  try {
    return await apiClient.get('/ai/stats', { cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch AI stats', 500);
  }
};
