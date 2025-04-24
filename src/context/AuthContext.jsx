// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, saveAuth, deleteAuth } from '@/lib/db';

// Contexto de autenticação usando IndexedDB (store "auth")
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getAuth();
        if (stored?.user) {
          setUserData(stored.user);
        }
      } catch (err) {
        console.error('Erro ao ler auth do IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistAuth = async ({ user, token }) => {
    try {
      await saveAuth({ id: 'current', user, token });
      setUserData(user);
    } catch (err) {
      console.error('Erro ao salvar auth:', err);
    }
  };
  
  const clearAuth = async () => {
    try {
      await deleteAuth();
      setUserData(null);
    } catch (err) {
      console.error('Erro ao deletar auth:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, loading, persistAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}