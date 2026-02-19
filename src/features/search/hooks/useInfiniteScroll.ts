"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: UseInfiniteScrollProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!hasMore) return;

    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        // prevent spam while loading
        if (isLoading) return;

        // prevent repeated triggers while still visible
        if (hasTriggeredRef.current) return;

        hasTriggeredRef.current = true;
        onLoadMore();
      },
      { threshold: 0.1 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  // reset trigger when loading finishes (so it can load next page)
  useEffect(() => {
    if (!isLoading) {
      hasTriggeredRef.current = false;
    }
  }, [isLoading]);

  return loadMoreRef;
}
