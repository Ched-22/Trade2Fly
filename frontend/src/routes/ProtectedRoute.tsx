import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authReady, loggedIn } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return null;
  }

  if (!loggedIn) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/entrar?returnTo=${returnTo}`} replace />;
  }

  return children;
}
