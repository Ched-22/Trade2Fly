import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { useAuth } from './context/AuthContext';
import { CompletedSalesPage } from './pages/CompletedSalesPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisputeDetailPage } from './pages/DisputeDetailPage';
import { DisputesPage } from './pages/DisputesPage';
import { ListingsPage } from './pages/ListingsPage';
import { LoginPage } from './pages/LoginPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UserOrdersPage } from './pages/UserOrdersPage';
import { UsersPage } from './pages/UsersPage';
import { ViolationsPage } from './pages/ViolationsPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authReady, user } = useAuth();
  if (!authReady) return <p className="p-6 text-cinza">Carregando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  const { authReady, user } = useAuth();

  if (!authReady) {
    return <p className="p-6 text-cinza">Carregando…</p>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="usuarios/:userId/pedidos" element={<UserOrdersPage />} />
        <Route path="usuarios/:userId" element={<UserDetailPage />} />
        <Route path="anuncios" element={<ListingsPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
        <Route path="disputas" element={<DisputesPage />} />
        <Route path="disputas/:orderId" element={<DisputeDetailPage />} />
        <Route path="vendas-concluidas" element={<CompletedSalesPage />} />
        <Route path="violacoes" element={<ViolationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
