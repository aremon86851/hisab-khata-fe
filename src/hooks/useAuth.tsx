import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TRole } from '../types';

type TCtx = {
  accessToken: string | null; role: TRole | null; shopId: string | null;
  isLoggedIn: boolean;
  login: (token: string, role: TRole, shopId?: string) => void;
  logout: () => void;
};

const Ctx = createContext<TCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [role,        setRole]        = useState<TRole | null>(() => localStorage.getItem('role') as TRole | null);
  const [shopId,      setShopId]      = useState<string | null>(() => localStorage.getItem('shopId'));

  const login = useCallback((t: string, r: TRole, s?: string) => {
    localStorage.setItem('accessToken', t);
    localStorage.setItem('role', r);
    if (s) localStorage.setItem('shopId', s); else localStorage.removeItem('shopId');
    setAccessToken(t); setRole(r); setShopId(s ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setAccessToken(null); setRole(null); setShopId(null);
  }, []);

  return (
    <Ctx.Provider value={{ accessToken, role, shopId, isLoggedIn: !!accessToken, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
};
