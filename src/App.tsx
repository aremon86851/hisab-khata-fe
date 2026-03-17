import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage    from './pages/auth/LoginPage';
import SignupPage   from './pages/auth/SignupPage';
import ShopkeeperApp from './pages/shopkeeper';
import CustomerApp   from './pages/customer';
import AdminApp      from './pages/admin';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn)                          return <Navigate to="/login" replace />;
  if (role && !roles.includes(role))        return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role === 'SHOPKEEPER' || role === 'STAFF') return <Navigate to="/shopkeeper" replace />;
  if (role === 'CUSTOMER')                        return <Navigate to="/customer"   replace />;
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return <Navigate to="/admin"      replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { isLoggedIn, role } = useAuth();

  const authRedirect = isLoggedIn
    ? <Navigate to={role === 'CUSTOMER' ? '/customer' : role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/shopkeeper'} replace />
    : undefined;

  return (
    <Routes>
      <Route path="/login"  element={authRedirect ?? <LoginPage />} />
      <Route path="/signup" element={authRedirect ?? <SignupPage />} />

      <Route path="/shopkeeper/*" element={
        <ProtectedRoute roles={['SHOPKEEPER', 'STAFF']}>
          <ShopkeeperApp />
        </ProtectedRoute>
      } />

      <Route path="/customer/*" element={
        <ProtectedRoute roles={['CUSTOMER']}>
          <CustomerApp />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
          <AdminApp />
        </ProtectedRoute>
      } />

      <Route path="/"   element={<HomeRedirect />} />
      <Route path="*"   element={<Navigate to="/" replace />} />
    </Routes>
  );
}
