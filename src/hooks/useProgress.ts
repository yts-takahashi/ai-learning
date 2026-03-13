'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProgress, markComplete, markIncomplete } from '@/lib/progress';

export function useProgress() {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCompletedSlugs(getProgress());
    setIsLoaded(true);
  }, []);

  const complete = useCallback((slug: string) => {
    markComplete(slug);
    setCompletedSlugs((prev) => {
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
  }, []);

  const incomplete = useCallback((slug: string) => {
    markIncomplete(slug);
    setCompletedSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      if (completedSlugs.has(slug)) {
        incomplete(slug);
      } else {
        complete(slug);
      }
    },
    [completedSlugs, complete, incomplete],
  );

  return {
    completedSlugs,
    isLoaded,
    complete,
    incomplete,
    toggle,
    isCompleted: (slug: string) => completedSlugs.has(slug),
  };
}
