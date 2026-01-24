import { jwtDecode } from 'jwt-decode';
import type { UserRole } from '@/types';

// ============ Types ============

export interface JwtPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
}

// ============ Constants ============

const TOKEN_KEY = 'token';

// ============ Token Utilities ============

/**
 * Get stored token from localStorage or sessionStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

/**
 * Save token to localStorage or sessionStorage
 * @param token - JWT token
 * @param persistent - If true, saves to localStorage (persists across browser sessions)
 */
export const setStoredToken = (token: string, persistent: boolean = false): void => {
  if (persistent) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Clear token from both localStorage and sessionStorage
 */
export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

/**
 * Check if the token is expired
 */
export const isTokenExpired = (decoded: JwtPayload): boolean => {
  if (!decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
};
