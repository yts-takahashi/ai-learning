'use client';

import { useRef, useCallback } from 'react';

export function useSwipe(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const startX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (startX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - startX.current;
    const threshold = 60;

    if (deltaX < -threshold) {
      onSwipeLeft?.();
    } else if (deltaX > threshold) {
      onSwipeRight?.();
    }

    startX.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchEnd };
}
