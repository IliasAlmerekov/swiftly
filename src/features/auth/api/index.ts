import {
  getCurrentSession as getCurrentSessionRequest,
  loginWithSession,
  logoutCurrentSession,
  refreshCurrentSession,
  registerWithSession,
} from '@/shared/api';
import { getAdminUsers as getAdminUsersRequest } from '@/shared/api/users';
import type {
  AdminUsersResponse,
  AuthLogoutResponse,
  AuthRefreshResponse,
  AuthUserResponse,
} from '@/types';

// ============ Authentication Functions ============

export const loginUser = (
  email: string,
  password: string,
  keepLoggedIn?: boolean,
): Promise<AuthUserResponse> => loginWithSession(email, password, keepLoggedIn);

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  keepLoggedIn?: boolean,
): Promise<AuthUserResponse> => registerWithSession(email, password, name, keepLoggedIn);

export const getCurrentSession = (): Promise<AuthUserResponse> => getCurrentSessionRequest();

export const refreshSession = (): Promise<AuthRefreshResponse> => refreshCurrentSession();

export const logoutUser = (allSessions?: boolean): Promise<AuthLogoutResponse> =>
  logoutCurrentSession(allSessions);

export const getAdminUsers = (): Promise<AdminUsersResponse> => getAdminUsersRequest();
