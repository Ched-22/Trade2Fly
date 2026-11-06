import { Bell, Heart, MessageCircle, type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useChatContext } from '../../context/ChatContext';
import { cn } from '../../lib/cn';
import { UserMenu } from './UserMenu';

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  count: number;
};

/** Barra fixa inferior, só no mobile: favoritos, notificações, mensagens e perfil. */
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { loggedIn, user, logout } = useAuth();
  const { favCount } = useMarketplace();
  const { unreadThreadCount, unreadNotificationCount } = useChatContext();

  if (!loggedIn || !user) return null;

  const items: NavItem[] = [
    { label: 'Favoritos', path: '/favoritos', icon: Heart, count: favCount },
    { label: 'Avisos', path: '/notificacoes', icon: Bell, count: unreadNotificationCount },
    { label: 'Mensagens', path: '/mensagens', icon: MessageCircle, count: unreadThreadCount },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-solo pb-[env(safe-area-inset-bottom)] text-white md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ label, path, icon: Icon, count }) => {
          const active = pathname.startsWith(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex cursor-pointer items-center justify-center border-t-2 py-3 transition-colors',
                active ? 'border-pull text-white' : 'border-transparent text-white/60',
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {count > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pull px-1 font-mono text-[10px] leading-none font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
        <UserMenu user={user} onLogout={logout} variant="bar" />
      </div>
    </nav>
  );
}
