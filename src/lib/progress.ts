const STORAGE_KEY = 'ai-learning-progress';

export function getProgress(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const data = JSON.parse(stored) as { completedSlugs: string[] };
    return new Set(data.completedSlugs ?? []);
  } catch {
    return new Set();
  }
}

export function markComplete(slug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const progress = getProgress();
    progress.add(slug);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedSlugs: Array.from(progress),
        lastUpdated: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage errors
  }
}

export function markIncomplete(slug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const progress = getProgress();
    progress.delete(slug);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedSlugs: Array.from(progress),
        lastUpdated: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage errors
  }
}

export function isCompleted(slug: string): boolean {
  return getProgress().has(slug);
}

export function getCompletionStats(): { completed: number; total: number } {
  const progress = getProgress();
  return {
    completed: progress.size,
    total: 0, // Will be filled by caller with actual total
  };
}
