import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './auth/LoginPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/useAuth';
import { CashierBillingPage } from './features/cashier/CashierBillingPage';
import { KitchenDashboard } from './features/kitchen/KitchenDashboard';
import { ManagerDashboardPage } from './features/manager/ManagerDashboardPage';
import { StaffDashboard } from './features/staff/StaffDashboard';
import { AdminLayout } from './layouts/AdminLayout';

const ROLE_HOME: Record<string, string> = {
  Manager: '/manager',
  Staff: '/staff',
  Kitchen: '/kitchen',
  Cashier: '/cashier',
};

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME[user?.role ?? ''] ?? '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/cashier" element={<CashierBillingPage />} />
        <Route path="/manager" element={<ManagerDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
