import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useGreeting } from './useGreeting';

describe('useGreeting', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns morning, afternoon and evening based on Europe/Berlin time', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-02-22T08:00:00.000Z'));
    const { result: morningResult } = renderHook(() => useGreeting());
    expect(morningResult.current.greeting).toBe('Good morning');

    vi.setSystemTime(new Date('2026-02-22T12:00:00.000Z'));
    const { result: afternoonResult } = renderHook(() => useGreeting());
    expect(afternoonResult.current.greeting).toBe('Good afternoon');

    vi.setSystemTime(new Date('2026-02-22T20:00:00.000Z'));
    const { result: eveningResult } = renderHook(() => useGreeting());
    expect(eveningResult.current.greeting).toBe('Good evening');
  });

  it('recalculates greeting on rerender', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22T08:00:00.000Z'));

    const { result, rerender } = renderHook(() => useGreeting());
    expect(result.current.greeting).toBe('Good morning');

    vi.setSystemTime(new Date('2026-02-22T20:00:00.000Z'));
    rerender();

    expect(result.current.greeting).toBe('Good evening');
  });
});
