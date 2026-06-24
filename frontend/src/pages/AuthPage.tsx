import { Outlet } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';

export function AuthPage() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
