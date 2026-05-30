import { useAuth } from './useAuth';
import type { UserRole } from '../types';

interface RoleGateProps {
  allow: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { hasRole } = useAuth();
  return hasRole(...allow) ? <>{children}</> : <>{fallback}</>;
}
