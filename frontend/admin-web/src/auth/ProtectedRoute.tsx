import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
