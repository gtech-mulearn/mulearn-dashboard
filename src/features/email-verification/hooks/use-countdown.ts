"use client";

import { useCallback, useEffect, useState } from "react";

/** Seconds left until a resend is allowed; ticks once a second. */
export function useCountdown(initialSeconds = 0) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.ceil(initialSeconds)),
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(
      () => setRemaining((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(
    (seconds: number) => setRemaining(Math.max(0, Math.ceil(seconds))),
    [],
  );

  return { remaining, start };
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
