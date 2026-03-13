import type { AuthUser } from '@/lib/types';

const AUTH_KEY = 'ai-learning-auth';

interface AuthData {
  token: string;
  user: AuthUser;
}

export function getAuth(): AuthData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthData;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  } catch {
    // Ignore storage errors
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignore storage errors
  }
}
