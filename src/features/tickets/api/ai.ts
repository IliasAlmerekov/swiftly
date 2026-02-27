import {
  ApiError,
  type ApiResponse,
  type AIResponse,
  type ChatRequest,
  type SolutionSearchResult,
} from '@/types';
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

const CSRF_HEADER_NAME = 'X-CSRF-Token';
let csrfTokenCache: string | null = null;

const extractCsrfToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.csrfToken === 'string' && record.csrfToken.trim().length > 0) {
    return record.csrfToken;
  }

  if (record.data && typeof record.data === 'object') {
    const dataRecord = record.data as Record<string, unknown>;
    if (typeof dataRecord.csrfToken === 'string' && dataRecord.csrfToken.trim().length > 0) {
      return dataRecord.csrfToken;
    }
  }

  return null;
};

const fetchCsrfToken = async (): Promise<string> => {
  const response = await apiClient.get<unknown>('/auth/csrf', {
    authMode: 'none',
    credentials: 'include',
  });
  const csrfToken = extractCsrfToken(response);

  if (!csrfToken) {
    throw new ApiError('CSRF bootstrap did not return csrfToken', 500, {
      endpoint: '/auth/csrf',
    });
  }

  csrfTokenCache = csrfToken;
  return csrfToken;
};

const getCsrfToken = async (): Promise<string> => {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  return fetchCsrfToken();
};

const postWithCsrf = async (endpoint: string, body?: unknown): Promise<unknown> => {
  const csrfToken = await getCsrfToken();

  try {
    return await apiClient.post<unknown>(endpoint, body, {
      credentials: 'include',
      headers: {
        [CSRF_HEADER_NAME]: csrfToken,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CSRF_INVALID') {
      csrfTokenCache = null;
      const refreshedToken = await fetchCsrfToken();
      return apiClient.post<unknown>(endpoint, body, {
        credentials: 'include',
        headers: {
          [CSRF_HEADER_NAME]: refreshedToken,
        },
      });
    }

    throw error;
  }
};

// ============ Chat ============

export const sendChatMessage = async (data: ChatRequest): Promise<ApiResponse<AIResponse>> => {
  try {
    const response = await postWithCsrf('/ai/chat', data);
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
    const response = await postWithCsrf(endpoint);
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
    const response = await postWithCsrf('/ai/feedback', {
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
