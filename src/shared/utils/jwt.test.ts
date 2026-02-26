import { describe, expect, it } from 'vitest';

import { decodeToken, isTokenExpired } from './jwt';

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const createToken = (payload: Record<string, unknown>) => {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe('jwt utils', () => {
  it('decodes valid token payload', () => {
    const token = createToken({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
    });

    expect(decodeToken(token)).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('returns null for malformed token', () => {
    expect(decodeToken('not-a-jwt')).toBeNull();
  });

  it('detects expired token by exp claim', () => {
    expect(isTokenExpired({ exp: Math.floor(Date.now() / 1000) - 60 })).toBe(true);
    expect(isTokenExpired({ exp: Math.floor(Date.now() / 1000) + 60 })).toBe(false);
  });
});
