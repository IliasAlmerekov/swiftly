import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loginUser } from '@/features/auth/api';
import { useAuthContext } from '@/shared/context/AuthContext';
import type { AuthSession } from '@/types';

import { useLogin } from './useLogin';

vi.mock('@/features/auth/api', () => ({
  loginUser: vi.fn(),
}));

vi.mock('@/shared/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

const mockedLoginUser = vi.mocked(loginUser);
const mockedUseAuthContext = vi.mocked(useAuthContext);

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

describe('useLogin', () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: loginMock,
      logout: vi.fn(),
      getToken: vi.fn(),
    });
  });

  it('keeps loading state on successful submit until navigation', async () => {
    const deferred = createDeferred<AuthSession>();
    const onLoginSuccess = vi.fn();

    mockedLoginUser.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useLogin({ onLoginSuccess }));

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('password123');
    });

    const event = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

    act(() => {
      void result.current.handleSubmit(event);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      deferred.resolve({ token: 'jwt-token' });
      await deferred.promise;
    });

    expect(loginMock).toHaveBeenCalledWith('jwt-token', false);
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);
  });

  it('resets loading and exposes error message on failed submit', async () => {
    const onLoginSuccess = vi.fn();
    mockedLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin({ onLoginSuccess }));

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('wrong-password');
    });

    const event = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');

    expect(loginMock).not.toHaveBeenCalled();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('ignores duplicate submits while request is already in flight', async () => {
    const deferred = createDeferred<AuthSession>();
    const onLoginSuccess = vi.fn();
    mockedLoginUser.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useLogin({ onLoginSuccess }));

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('password123');
    });

    const firstEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
    const secondEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

    act(() => {
      void result.current.handleSubmit(firstEvent);
      void result.current.handleSubmit(secondEvent);
    });

    expect(mockedLoginUser).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.reject(new Error('Abort pending request'));
      try {
        await deferred.promise;
      } catch {
        // ignore expected rejection for cleanup
      }
    });
  });
});
