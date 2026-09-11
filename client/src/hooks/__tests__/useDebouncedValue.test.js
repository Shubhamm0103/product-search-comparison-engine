import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebouncedValue from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not update the value immediately', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    expect(result.current).toBe('a'); // hasn't updated yet
  });

  it('updates the value after the delay passes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('ab');
  });

  it('resets the timer if the value changes again before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: 'abc' });
    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current).toBe('a'); // still hasn't settled — timer restarted
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('abc');
  });
});
