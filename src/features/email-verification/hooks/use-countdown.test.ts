import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatCountdown, useCountdown } from "./use-countdown";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts down to zero once started", () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.remaining).toBe(0);
    act(() => result.current.start(2));
    expect(result.current.remaining).toBe(2);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(0);
  });

  it("formats as m:ss", () => {
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(9)).toBe("0:09");
  });
});
