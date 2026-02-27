import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserProfile } from './users';

const buildProfileResponse = () =>
  new Response(
    JSON.stringify({
      _id: 'u-1',
      email: 'user@example.com',
      name: 'User',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  );

describe('shared/api/getUserProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deduplicates concurrent profile requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildProfileResponse());

    const first = getUserProfile();
    const second = getUserProfile();

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult._id).toBe('u-1');
    expect(secondResult._id).toBe('u-1');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('allows subsequent profile requests after previous request settles', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(buildProfileResponse())
      .mockResolvedValueOnce(buildProfileResponse());

    await getUserProfile();
    await getUserProfile();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
