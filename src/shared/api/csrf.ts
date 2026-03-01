import { ApiError } from '@/types';
import { apiClient } from './client';

const CSRF_HEADER_NAME = 'X-CSRF-Token';
let csrfTokenCache: string | null = null;

const extractCsrfToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
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
  if (csrfTokenCache) return csrfTokenCache;
  return fetchCsrfToken();
};

export const postWithCsrf = async (
  endpoint: string,
  body?: unknown,
  options: { authMode?: 'required' | 'none'; credentials?: RequestCredentials } = {},
): Promise<unknown> => {
  const { authMode = 'required', credentials } = options;
  const csrfToken = await getCsrfToken();
  try {
    return await apiClient.post<unknown>(endpoint, body, {
      authMode,
      credentials,
      headers: { [CSRF_HEADER_NAME]: csrfToken },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CSRF_INVALID') {
      csrfTokenCache = null;
      const refreshedToken = await fetchCsrfToken();
      return apiClient.post<unknown>(endpoint, body, {
        authMode,
        credentials,
        headers: { [CSRF_HEADER_NAME]: refreshedToken },
      });
    }
    throw error;
  }
};
