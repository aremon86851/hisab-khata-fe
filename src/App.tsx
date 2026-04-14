// ─── তোমার App.tsx — complete routing ────────────────────────────────────────

import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPinPage from "./pages/auth/ForgotPinPage";

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
import CustomerTxnView from "./pages/public/CustomerTxnView";
import ShopVerificationPage from "./pages/shopkeeper/ShopSettings";
import FraudCheckerPage from "./pages/shopkeeper/FraudCheckerPage";
import FraudFeedPage from "./pages/shopkeeper/FraudFeedPage";
import RequestsPage from "./pages/shopkeeper/RequestsPage";
import ReportsPage from "./pages/shopkeeper/ReportsPage";
import CampaignsPage from "./pages/shopkeeper/CampaignsPage";
import CampaignDetailPage from "./pages/shopkeeper/CampaignDetailPage";
import CustomerCampaignsPage from "./pages/customer/CustomerCampaignsPage";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import StaffPermissionGate from "./components/StaffPermissionGate";

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
  if (role === "STAFF") return <Navigate to="/staff/dashboard" replace />;
  if (role === "ADMIN" || role === "SUPER_ADMIN")
    return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/shopkeeper/dashboard" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { isLoggedIn, role } = useAuth();
  const { sid, cid } = useParams();

  const authRedirect = isLoggedIn ? (
    <Navigate
      to={
        role === "CUSTOMER"
          ? "/customer/home"
          : role === "STAFF"
            ? "/staff/dashboard"
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
      <Route path="/forgot-pin" element={<ForgotPinPage />} />

      {/* ── Shopkeeper ── */}
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute roles={["SHOPKEEPER"]}>
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
        <Route path="verification" element={<ShopVerificationPage />} />
        <Route path="fraud" element={<FraudCheckerPage />} />
        <Route path="fraud/feed" element={<FraudFeedPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
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
        <Route path="campaigns" element={<CustomerCampaignsPage />} />
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
      <Route path="/txn/:sid/:cid" element={<CustomerTxnView />} />

      {/* ── Staff ── */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["STAFF"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route
          path="customers"
          element={
            <StaffPermissionGate
              requires={["canAddBaki", "canAddPayment", "canAddCustomer"]}
            >
              <CustomersPage />
            </StaffPermissionGate>
          }
        />
        <Route
          path="customer/:id"
          element={
            <StaffPermissionGate
              requires={["canAddBaki", "canAddPayment", "canAddCustomer"]}
            >
              <CustomerViewPage />
            </StaffPermissionGate>
          }
        />
        <Route
          path="calculator"
          element={
            <StaffPermissionGate requires={["canAddBaki", "canAddPayment"]}>
              <CalculatorPage />
            </StaffPermissionGate>
          }
        />
        <Route
          path="products"
          element={
            <StaffPermissionGate requires={["canManageProduct"]}>
              <ProductsPage />
            </StaffPermissionGate>
          }
        />
        <Route
          path="reminders"
          element={
            <StaffPermissionGate requires={["canSendReminder"]}>
              <RemindersPage />
            </StaffPermissionGate>
          }
        />
        <Route
          path="reports"
          element={
            <StaffPermissionGate requires={["canViewReport"]}>
              <ReportsPage />
            </StaffPermissionGate>
          }
        />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
