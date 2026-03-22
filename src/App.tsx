// ─── তোমার App.tsx — complete routing ────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Shopkeeper
import ShopkeeperLayout from "./pages/shopkeeper/ShopkeeperLayout";
import DashboardPage from "./pages/shopkeeper/DashboardPage";
import CalculatorPage from "./pages/shopkeeper/CalculatorPage";
import CustomersPage from "./pages/shopkeeper/CustomersPage";
import ProductsPage from "./pages/shopkeeper/ProductsPage";
import RemindersPage from "./pages/shopkeeper/RemindersPage";
import IncomeExpensePage from "./pages/shopkeeper/IncomeExpensePage";
import StaffPage from "./pages/shopkeeper/StaffPage";
import NotificationsPage from "./pages/shopkeeper/NotificationsPage";
import SettingsPage from "./pages/shopkeeper/SettingsPage";

// Customer
import CustomerLayout from "./pages/customer/CustomerLayout";
import HomePage from "./pages/customer/HomePage";
import ShopsPage from "./pages/customer/ShopsPage";
import ProfilePage from "./pages/customer/ProfilePage";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminShopsPage from "./pages/admin/AdminShopsPage";
import AdminVerificationsPage from "./pages/admin/AdminVerificationsPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
import CustomerViewPage from "./pages/shopkeeper/CustomerViewPage";

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Home redirect based on role ───────────────────────────────────────────────
function HomeRedirect() {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role === "CUSTOMER") return <Navigate to="/customer/home" replace />;
  if (role === "ADMIN" || role === "SUPER_ADMIN")
    return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/shopkeeper/dashboard" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { isLoggedIn, role } = useAuth();

  const authRedirect = isLoggedIn ? (
    <Navigate
      to={
        role === "CUSTOMER"
          ? "/customer/home"
          : role === "ADMIN" || role === "SUPER_ADMIN"
            ? "/admin/dashboard"
            : "/shopkeeper/dashboard"
      }
      replace
    />
  ) : undefined;

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={authRedirect ?? <LoginPage />} />
      <Route path="/signup" element={authRedirect ?? <SignupPage />} />

      {/* ── Shopkeeper ── */}
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute roles={["SHOPKEEPER", "STAFF"]}>
            <ShopkeeperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customer/:id" element={<CustomerViewPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="income" element={<IncomeExpensePage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ── Customer ── */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={["CUSTOMER"]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="shops" element={<ShopsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── Admin ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="shops" element={<AdminShopsPage />} />
        <Route path="verifications" element={<AdminVerificationsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
