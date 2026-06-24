import { Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { profileSettingsNav } from '../../data/profileSettingsNav';
import { cn } from '../../lib/cn';

export function ProfileSettingsNav() {
  return (
    <nav aria-label="Configurações do perfil" className="flex flex-col gap-1">
      {profileSettingsNav.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === '/perfil'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-solo text-white'
                : 'text-solo hover:bg-bruma',
            )
          }
        >
          {item.icon === 'settings' ? (
            <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden />
          ) : null}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
