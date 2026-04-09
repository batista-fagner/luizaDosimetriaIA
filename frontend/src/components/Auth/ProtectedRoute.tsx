import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const email = localStorage.getItem('studentEmail');
  if (!email) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
