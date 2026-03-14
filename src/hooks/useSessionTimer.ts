'use client';

import { useEffect, useRef } from 'react';
import { saveSession } from '@/lib/sessionHistory';

export function useSessionTimer(slug: string) {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    function flush() {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      saveSession(slug, elapsed);
    }

    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });

    return () => {
      flush();
      window.removeEventListener('beforeunload', flush);
    };
  }, [slug]);
}
