import { useOutletContext } from "react-router-dom";
import { useAuth } from "./useAuth";

export type StaffPerms = {
  canAddBaki: boolean;
  canAddPayment: boolean;
  canAddCustomer: boolean;
  canViewReport: boolean;
  canManageProduct: boolean;
  canSendReminder: boolean;
};

type StaffOutletCtx = {
  shop: any;
  permissions: Record<string, boolean>;
};

const ALL_TRUE: StaffPerms = {
  canAddBaki: true,
  canAddPayment: true,
  canAddCustomer: true,
  canViewReport: true,
  canManageProduct: true,
  canSendReminder: true,
};

/**
 * Returns staff permissions from StaffLayout's Outlet context.
 * For shopkeepers, returns all-true (full access).
 */
export function useStaffPermissions(): StaffPerms {
  const { role } = useAuth();

  // Shopkeepers always have full access
  if (role !== "STAFF") return ALL_TRUE;

  try {
    const ctx = useOutletContext<StaffOutletCtx>();
    const p = ctx?.permissions;
    return {
      canAddBaki: !!p?.canAddBaki,
      canAddPayment: !!p?.canAddPayment,
      canAddCustomer: !!p?.canAddCustomer,
      canViewReport: !!p?.canViewReport,
      canManageProduct: !!p?.canManageProduct,
      canSendReminder: !!p?.canSendReminder,
    };
  } catch {
    return ALL_TRUE;
  }
}
