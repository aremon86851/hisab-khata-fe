import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useStaffPermissions, type StaffPerms } from "../hooks/useStaffPermissions";

type Props = {
  /** Permission key(s) required — access granted if ANY are true */
  requires: (keyof StaffPerms)[];
  children: React.ReactNode;
};

/**
 * Wraps a page component. For shopkeepers, always renders children.
 * For staff, checks that at least one required permission is true.
 * If not, shows a "no access" screen.
 */
export default function StaffPermissionGate({ requires, children }: Props) {
  const { role } = useAuth();

  // Shopkeepers bypass all permission checks
  if (role !== "STAFF") return <>{children}</>;

  const perms = useStaffPermissions();
  const hasAccess = requires.some((key) => perms[key]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
          অনুমতি নেই
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
          এই পেজে আপনার অ্যাক্সেস নেই। দোকানদারের সাথে যোগাযোগ করুন।
        </p>
        <Navigate to="/staff/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
}
