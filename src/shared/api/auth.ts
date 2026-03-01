import type { AuthLogoutResponse, AuthRefreshResponse, AuthUserResponse } from '@/types';

import { apiClient } from './client';
import {
  authLogoutResponseSchema,
  authRefreshResponseSchema,
  authUserResponseSchema,
  normalizeApiModuleError,
  parseEntityOrApiResponse,
} from './contracts';
import { postWithCsrf } from './csrf';

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
