import type { ApiResponse, AIResponse, ChatRequest, SolutionSearchResult } from '@/types';
import { apiClient } from '@/shared/api';
import {
  aiResponseSchema,
  aiStatsResponseSchema,
  apiResponseSchema,
  normalizeApiModuleError,
  parseApiPayload,
  solutionSearchResultSchema,
} from '@/shared/api/contracts';
import { z } from 'zod';

// ============ Chat ============

export const sendChatMessage = async (data: ChatRequest): Promise<ApiResponse<AIResponse>> => {
  try {
    const response = await apiClient.post<unknown>('/ai/chat', data);
    return parseApiPayload(apiResponseSchema(aiResponseSchema), response, { endpoint: '/ai/chat' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to send chat message');
  }
};

// ============ Solutions ============

export const searchSolutions = async (
  query: string,
): Promise<ApiResponse<SolutionSearchResult[]>> => {
  const endpoint = `/ai/solutions/search?query=${encodeURIComponent(query)}`;
  try {
    const response = await apiClient.get<unknown>(endpoint);
    return parseApiPayload(apiResponseSchema(z.array(solutionSearchResultSchema)), response, {
      endpoint,
    });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to search solutions');
  }
};

export const getTicketSuggestions = async (ticketId: string): Promise<ApiResponse<AIResponse>> => {
  const endpoint = `/ai/tickets/${ticketId}/suggestions`;
  try {
    const response = await apiClient.get<unknown>(endpoint);
    return parseApiPayload(apiResponseSchema(aiResponseSchema), response, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch ticket suggestions');
  }
};

export const generateSolution = async (ticketId: string): Promise<ApiResponse<AIResponse>> => {
  const endpoint = `/ai/tickets/${ticketId}/solution`;
  try {
    const response = await apiClient.post<unknown>(endpoint);
    return parseApiPayload(apiResponseSchema(aiResponseSchema), response, { endpoint });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to generate AI solution');
  }
};

// ============ Feedback ============

export const submitAIFeedback = async (
  sessionId: string,
  isHelpful: boolean,
  feedback?: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await apiClient.post<unknown>('/ai/feedback', {
      sessionId,
      isHelpful,
      feedback,
    });
    return parseApiPayload(
      apiResponseSchema(
        z
          .object({
            message: z.string(),
          })
          .passthrough(),
      ),
      response,
      { endpoint: '/ai/feedback' },
    );
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to submit AI feedback');
  }
};

// ============ Stats ============

export const getAIStats = async () => {
  try {
    const response = await apiClient.get<unknown>('/ai/stats', { cache: 'no-store' });
    return parseApiPayload(aiStatsResponseSchema, response, { endpoint: '/ai/stats' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch AI stats');
  }
};
