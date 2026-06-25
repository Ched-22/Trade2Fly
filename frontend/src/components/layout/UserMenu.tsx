import {
  CircleHelp,
  Heart,
  LogOut,
  MessageCircle,
  Settings,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AuthUser } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

type UserMenuProps = {
  user: AuthUser;
  onLogout: () => void;
};

type MenuItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

function MenuDivider() {
  return <div className="my-1 h-px bg-nuvem" role="separator" />;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => setOpen(false);

  const go = (path: string) => {
    navigate(path);
    close();
  };

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const primaryItems: MenuItem[] = [
    { label: 'Meu perfil', icon: <User className="h-[18px] w-[18px]" />, onClick: () => go('/perfil') },
    { label: 'Meus anúncios', icon: <Store className="h-[18px] w-[18px]" />, onClick: () => go('/meus-anuncios') },
    { label: 'Meus pedidos', icon: <ShoppingBag className="h-[18px] w-[18px]" />, onClick: () => go('/pedidos') },
    { label: 'Favoritos', icon: <Heart className="h-[18px] w-[18px]" />, onClick: () => go('/favoritos') },
    { label: 'Mensagens', icon: <MessageCircle className="h-[18px] w-[18px]" />, onClick: () => go('/mensagens') },
  ];

  const secondaryItems: MenuItem[] = [
    { label: 'Configurações', icon: <Settings className="h-[18px] w-[18px]" />, onClick: () => go('/configuracoes') },
    { label: 'Ajuda e suporte', icon: <CircleHelp className="h-[18px] w-[18px]" />, onClick: () => go('/faq') },
  ];

  const renderItem = (item: MenuItem) => (
    <button
      key={item.label}
      type="button"
      role="menuitem"
      onClick={item.onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 border-none px-4 py-2.5 text-left text-sm font-medium',
        item.destructive
          ? 'text-error hover:bg-red-50'
          : 'text-solo hover:bg-bruma',
      )}
    >
      <span className={item.destructive ? 'text-error' : 'text-cinza'}>{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-nuvem bg-white py-1 pr-1 pl-1 text-solo transition-colors hover:bg-bruma sm:pr-3"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-solo text-xs font-bold text-white sm:h-[30px] sm:w-[30px] sm:text-sm">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            user.initials
          )}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{user.displayName}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-[60] mt-2 w-[min(100vw-2rem,280px)] overflow-hidden rounded-lg border border-nuvem bg-white py-1 text-solo shadow-lg sm:w-auto sm:min-w-[240px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-4 py-3">
            <div className="font-semibold text-solo">{user.displayName}</div>
            <div className="text-sm text-cinza">{user.email}</div>
          </div>

          <MenuDivider />

          {primaryItems.map(renderItem)}

          <MenuDivider />

          {secondaryItems.map(renderItem)}

          <MenuDivider />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onLogout();
            }}
            className="flex w-full cursor-pointer items-center gap-3 border-none px-4 py-2.5 text-left text-sm font-medium text-error hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
