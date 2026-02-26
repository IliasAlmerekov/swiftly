import { jwtDecode } from 'jwt-decode';
import type { UserRole } from '@/types';

export interface JwtPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
}

/**
 * Decode JWT token payload.
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

/**
 * Check if decoded JWT is expired.
 */
export const isTokenExpired = (decoded: JwtPayload): boolean => {
  if (!decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
};
