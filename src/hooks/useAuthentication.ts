// src/hooks/useAuthentication.ts
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { saveAuth, getAuth, deleteAuth } from '@/lib/db';

// Simplified user type (adjust fields as per your API)
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
};

// Payloads for auth actions
type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; role?: string; status?: string };

type AccessToken = {
  created_at: string;
  expires_at: string;
  token: string;
  token_type: string;
}

// Shape of the response from the auth API
interface AuthResponse {
  access_token: AccessToken;
  user: AuthUser;
  
}

interface UseAuthenticationReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialising: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export function useAuthentication(): UseAuthenticationReturn {
  const { userData, setUserData } = useContext(AuthContext);
  const [isInitialising, setIsInitialising] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Centraliza captura de erros
  const withErrorHandler = <T extends any[]>(fn: (...args: T) => Promise<any>) =>
    async (...args: T) => {
      setError(null);
      try {
        return await fn(...args);
      } catch (err: any) {
        const message = err?.message || 'Erro inesperado';
        setError(message);
        throw err;
      }
    };

  // Fetch wrapper
  const fetchJson = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  };

  const login = useCallback(
    withErrorHandler(async (email: string, password: string) => {
      const data = await fetchJson<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUserData(data.user);
      await saveAuth({ id: 'current', user: data.user, token: data.access_token.token, created_at: data.access_token.created_at, expiresAt: data.access_token.expires_at });
      return data.user;
    }),
    [setUserData]
  );

  const register = useCallback(
    withErrorHandler(async (payload: RegisterPayload) => {
      const data = await fetchJson<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data.user;
    }),
    []
  );

  const logout = useCallback(
    withErrorHandler(async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // silencioso se offline
      }
      setUserData(null);
      await deleteAuth();
    }),
    [setUserData]
  );



  // Tenta restaurar sessão do IndexedDB na inicialização
  useEffect(() => {
    (async () => {
      try {
        const stored = await getAuth();
        if (stored?.user && stored?.token) {
          setUserData(stored.user);
        }
      } catch (err) {
        console.error('Erro ao carregar auth do IndexedDB:', err);
      } finally {
        setIsInitialising(false);
      }
    })();
  }, [setUserData]);

  const isAuthenticated = Boolean(userData);

  return {
    user: userData,
    isAuthenticated,
    isInitialising,
    error,
    login,
    register,
    logout
  };
}
