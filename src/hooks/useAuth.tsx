import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { TRole } from "../types";

export type TStaffPermissions = {
  canAddBaki: boolean;
  canAddPayment: boolean;
  canAddCustomer: boolean;
  canViewReport: boolean;
  canManageProduct: boolean;
  canSendReminder: boolean;
};

type TCtx = {
  accessToken: string | null;
  role: TRole | null;
  shopId: string | null;
  shopCode: string | null;
  permissions: TStaffPermissions | null;
  isLoggedIn: boolean;
  login: (token: string, role: TRole, shopId?: string, shopCode?: string, permissions?: TStaffPermissions) => void;
  logout: () => void;
};

const Ctx = createContext<TCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );
  const [role, setRole] = useState<TRole | null>(
    () => localStorage.getItem("role") as TRole | null,
  );
  const [shopId, setShopId] = useState<string | null>(() =>
    localStorage.getItem("shopId"),
  );
  const [shopCode, setShopCode] = useState<string | null>(() =>
    localStorage.getItem("shopCode"),
  );
  const [permissions, setPermissions] = useState<TStaffPermissions | null>(() => {
    const p = localStorage.getItem("permissions");
    return p ? JSON.parse(p) : null;
  });

  const login = useCallback((t: string, r: TRole, s?: string, ssc?: string, perms?: TStaffPermissions) => {
    localStorage.setItem("accessToken", t);
    localStorage.setItem("role", r);
    if (s) localStorage.setItem("shopId", s);
    else localStorage.removeItem("shopId");
    if (perms) localStorage.setItem("permissions", JSON.stringify(perms));
    else localStorage.removeItem("permissions");
    setAccessToken(t);
    setRole(r);
    setShopId(s ?? null);
    setShopCode(ssc ?? null);
    setPermissions(perms ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setAccessToken(null);
    setRole(null);
    setShopId(null);
    setShopCode(null);
    setPermissions(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        accessToken,
        role,
        shopId,
        shopCode,
        permissions,
        isLoggedIn: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
