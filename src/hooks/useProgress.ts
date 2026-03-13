'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProgress,
  markComplete as localMarkComplete,
  markIncomplete as localMarkIncomplete,
} from '@/lib/progress';
import {
  fetchProgress,
  markComplete as apiMarkComplete,
  markIncomplete as apiMarkIncomplete,
} from '@/lib/api';
import { getAuth } from '@/lib/auth';

export function useProgress() {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      fetchProgress(auth.token)
        .then((res) => {
          setCompletedSlugs(new Set(res.completedSlugs));
        })
        .catch(() => {
          setCompletedSlugs(getProgress());
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setCompletedSlugs(getProgress());
      setIsLoaded(true);
    }
  }, []);

  const complete = useCallback((slug: string) => {
    const auth = getAuth();
    if (auth) {
      apiMarkComplete(slug, auth.token).catch(() => {
        // Ignore API errors silently
      });
    } else {
      localMarkComplete(slug);
    }
    setCompletedSlugs((prev) => {
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
  }, []);

  const incomplete = useCallback((slug: string) => {
    const auth = getAuth();
    if (auth) {
      apiMarkIncomplete(slug, auth.token).catch(() => {
        // Ignore API errors silently
      });
    } else {
      localMarkIncomplete(slug);
    }
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
