import type { AuthLogoutResponse, AuthRefreshResponse, AuthUserResponse } from '@/types';
import { ApiError } from '@/types';

import { apiClient } from './client';
import {
  authLogoutResponseSchema,
  authRefreshResponseSchema,
  authUserResponseSchema,
  normalizeApiModuleError,
  parseEntityOrApiResponse,
} from './contracts';

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

const postWithCsrf = async (
  endpoint: string,
  body: unknown,
  options: { authMode: 'required' | 'none'; credentials?: RequestCredentials },
): Promise<unknown> => {
  const csrfToken = await getCsrfToken();

  try {
    return await apiClient.post<unknown>(endpoint, body, {
      authMode: options.authMode,
      credentials: options.credentials,
      headers: {
        [CSRF_HEADER_NAME]: csrfToken,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CSRF_INVALID') {
      csrfTokenCache = null;
      const refreshedToken = await fetchCsrfToken();
      return apiClient.post<unknown>(endpoint, body, {
        authMode: options.authMode,
        credentials: options.credentials,
        headers: {
          [CSRF_HEADER_NAME]: refreshedToken,
        },
      });
    }

    throw error;
  }
};

export const loginWithSession = async (
  email: string,
  password: string,
  keepLoggedIn?: boolean,
): Promise<AuthUserResponse> => {
  try {
    const response = await postWithCsrf(
      '/auth/login',
      { email, password, keepLoggedIn },
      { authMode: 'none', credentials: 'include' },
    );
    return parseEntityOrApiResponse(response, authUserResponseSchema, { endpoint: '/auth/login' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to login');
  }
};

export const registerWithSession = async (
  email: string,
  password: string,
  name: string,
  keepLoggedIn?: boolean,
): Promise<AuthUserResponse> => {
  try {
    const response = await postWithCsrf(
      '/auth/register',
      { email, password, name, keepLoggedIn },
      { authMode: 'none', credentials: 'include' },
    );
    return parseEntityOrApiResponse(response, authUserResponseSchema, {
      endpoint: '/auth/register',
    });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to register');
  }
};

export const getCurrentSession = async (): Promise<AuthUserResponse> => {
  try {
    const response = await apiClient.get<unknown>('/auth/me', { authMode: 'required' });
    return parseEntityOrApiResponse(response, authUserResponseSchema, { endpoint: '/auth/me' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch current session');
  }
};

export const refreshCurrentSession = async (): Promise<AuthRefreshResponse> => {
  try {
    const response = await postWithCsrf('/auth/refresh', undefined, {
      authMode: 'required',
    });
    return parseEntityOrApiResponse(response, authRefreshResponseSchema, {
      endpoint: '/auth/refresh',
    });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to refresh session');
  }
};

export const logoutCurrentSession = async (allSessions?: boolean): Promise<AuthLogoutResponse> => {
  try {
    const payload = allSessions === undefined ? undefined : { allSessions };
    const response = await postWithCsrf('/auth/logout', payload, { authMode: 'required' });
    return parseEntityOrApiResponse(response, authLogoutResponseSchema, {
      endpoint: '/auth/logout',
    });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to logout');
  }
};
