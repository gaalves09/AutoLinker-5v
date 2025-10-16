// src/auth.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';

export type Role = 'Motorista' | 'Locadora';
export type User = { id: string; nome: string; email: string; role: Role; passHash: string };

type AuthCtx = {
  user: Omit<User, 'passHash'> | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

function sha1(str: string) {
  // Hash simplificado apenas para MVP (não usar em produção)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('@autolinker/users', []);
  const [session, setSession] = useLocalStorage<Omit<User, 'passHash'> | null>('@autolinker/session', null);
  const [busy, setBusy] = useState(false);

  async function register(nome: string, email: string, senha: string, role: Role) {
    setBusy(true);
    try {
      email = email.trim().toLowerCase();
      if (users.some(u => u.email === email)) throw new Error('Este e-mail já está cadastrado.');
      const newUser: User = {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        email,
        role,
        passHash: sha1(senha),
      };
      const next = [...users, newUser];
      setUsers(next);
      const { passHash, ...pub } = newUser;
      setSession(pub);
    } finally {
      setBusy(false);
    }
  }

  async function login(email: string, senha: string) {
    setBusy(true);
    try {
      email = email.trim().toLowerCase();
      const found = users.find(u => u.email === email);
      if (!found) throw new Error('Usuário não encontrado.');
      if (found.passHash !== sha1(senha)) throw new Error('Senha incorreta.');
      const { passHash, ...pub } = found;
      setSession(pub);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setSession(null);
  }

  const value = useMemo<AuthCtx>(() => ({
    user: session,
    login,
    register,
    logout
  }), [session, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
