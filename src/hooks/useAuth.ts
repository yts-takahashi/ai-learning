'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, setAuth, clearAuth } from '@/lib/auth';
import { login as apiLogin, register as apiRegister } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth.user);
      setToken(auth.token);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiRegister(email, password);
    setAuth(res.token, res.user);
    setUser(res.user);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    token,
    isLoggedIn: user !== null,
    login,
    register,
    logout,
  };
}
