import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';

import { getGreetingForDate, useGreeting } from './useGreeting';

describe('useGreeting', () => {
  it('returns morning, afternoon and evening based on Europe/Berlin time', () => {
    expect(getGreetingForDate(new Date('2026-02-22T08:00:00.000Z'))).toBe('Good morning');
    expect(getGreetingForDate(new Date('2026-02-22T12:00:00.000Z'))).toBe('Good afternoon');
    expect(getGreetingForDate(new Date('2026-02-22T20:00:00.000Z'))).toBe('Good evening');
  });

  it('returns one of supported greeting variants in hook result', () => {
    const { result } = renderHook(() => useGreeting());
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(result.current.greeting);
  });
});
