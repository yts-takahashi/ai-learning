import type { AuthResponse, ProgressResponse } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? '登録に失敗しました');
  }
  return res.json() as Promise<AuthResponse>;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'ログインに失敗しました');
  }
  return res.json() as Promise<AuthResponse>;
}

export async function fetchProgress(token: string): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE}/api/progress`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('進捗の取得に失敗しました');
  return res.json() as Promise<ProgressResponse>;
}

export async function markComplete(slug: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/progress/${slug}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('進捗の更新に失敗しました');
}

export async function markIncomplete(slug: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/progress/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('進捗の更新に失敗しました');
}
