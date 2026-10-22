import { NavLink, Outlet } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Scale,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/anuncios', label: 'Anúncios', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/disputas', label: 'Disputas', icon: Scale },
  { to: '/vendas-concluidas', label: 'Vendas concluídas', icon: CheckCircle },
  { to: '/violacoes', label: 'Violações', icon: AlertTriangle },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-nuvem bg-white p-4">
        <div className="mb-8 px-2">
          <div className="font-display text-lg font-extrabold text-solo">Trade2Fly</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-voo">Admin</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive ? 'bg-voo-light text-voo' : 'text-solo hover:bg-bruma'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-nuvem pt-4">
          <div className="mb-3 px-2 text-sm">
            <div className="font-semibold">{user?.displayName}</div>
            <div className="truncate text-xs text-cinza">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-pull hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
