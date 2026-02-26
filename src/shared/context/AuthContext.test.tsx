import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserProfile } from '@/shared/api/users';

import { AuthProvider, useAuthContext } from './AuthContext';

vi.mock('@/shared/api/users', () => ({
  getUserProfile: vi.fn(),
}));

const mockedGetUserProfile = vi.mocked(getUserProfile);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const createJwt = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads authenticated user from server session on mount', async () => {
    mockedGetUserProfile.mockResolvedValueOnce({
      _id: 'u1',
      email: 'user@example.com',
      name: 'User',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      role: 'admin',
    });
  });

  it('stays unauthenticated when server session is absent', async () => {
    mockedGetUserProfile.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates user state on login using returned token payload', async () => {
    mockedGetUserProfile.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const token = createJwt({
      id: 'u2',
      email: 'new@example.com',
      name: 'New User',
      role: 'support1',
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    act(() => {
      result.current.login(token, true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: 'u2',
      email: 'new@example.com',
      name: 'New User',
      role: 'support1',
    });
  });
});
