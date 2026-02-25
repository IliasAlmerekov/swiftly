import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { API_BASE_URL } from '@/shared/api/client';

import { getUserProfile } from './index';

describe('getUserProfile', () => {
  it('normalizes nullable manager/avatar and missing timestamps', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/profile`, () =>
        HttpResponse.json(
          {
            _id: 'u-profile',
            email: 'profile.user@example.com',
            name: 'Profile User',
            role: 'user',
            manager: null,
            avatar: null,
          },
          { status: 200 },
        ),
      ),
    );

    const result = await getUserProfile();

    expect(result).toMatchObject({
      _id: 'u-profile',
      email: 'profile.user@example.com',
      name: 'Profile User',
      role: 'user',
    });
    expect(result.createdAt).toBe('1970-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(result.manager).toBeUndefined();
    expect(result.avatar).toBeUndefined();
  });

  it('normalizes nullable profile fields and string manager id to undefined', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/profile`, () =>
        HttpResponse.json(
          {
            _id: 'u-nullable-profile',
            email: 'nullable.profile@example.com',
            name: 'Nullable Profile',
            role: 'user',
            manager: 'manager-id-only',
            company: null,
            department: null,
            position: null,
            country: null,
            city: null,
            address: null,
            postalCode: null,
            lastSeen: null,
            avatar: null,
          },
          { status: 200 },
        ),
      ),
    );

    const result = await getUserProfile();

    expect(result).toMatchObject({
      _id: 'u-nullable-profile',
      email: 'nullable.profile@example.com',
      name: 'Nullable Profile',
      role: 'user',
    });
    expect(result.manager).toBeUndefined();
    expect(result.company).toBeUndefined();
    expect(result.department).toBeUndefined();
    expect(result.position).toBeUndefined();
    expect(result.country).toBeUndefined();
    expect(result.city).toBeUndefined();
    expect(result.address).toBeUndefined();
    expect(result.postalCode).toBeUndefined();
    expect(result.lastSeen).toBeUndefined();
    expect(result.avatar).toBeUndefined();
  });

  it('throws BAD_RESPONSE for malformed profile payload', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/profile`, () =>
        HttpResponse.json(
          {
            email: 'missing-id@example.com',
            name: 'Broken User',
            role: 'user',
          },
          { status: 200 },
        ),
      ),
    );

    await expect(getUserProfile()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
  });

  it('maps timeout errors to status 408 and TIMEOUT code', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));

    try {
      await expect(getUserProfile()).rejects.toMatchObject({
        name: 'ApiError',
        status: 408,
        code: 'TIMEOUT',
      });
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('preserves unauthorized responses as UNAUTHORIZED errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/profile`, () =>
        HttpResponse.json({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );

    await expect(getUserProfile()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
