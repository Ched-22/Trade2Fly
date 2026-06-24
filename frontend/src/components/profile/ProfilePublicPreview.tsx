import { Link } from 'react-router-dom';
import type { ProfileData } from '../../types/profile';
import { deriveInitials } from '../../lib/profileStorage';
import { Button } from '../ui/Button';

type ProfilePublicPreviewProps = {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  email: string;
};

export function ProfilePublicPreview({ open, onClose, profile, email }: ProfilePublicPreviewProps) {
  if (!open) return null;

  const initials = deriveInitials(profile.firstName, profile.lastName);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-preview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-nuvem bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id="profile-preview-title" className="font-display text-xl font-bold text-solo">
            Perfil público
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-cinza hover:text-solo"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="mb-4 h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-solo text-2xl font-bold text-white">
              {initials}
            </span>
          )}

          <h3 className="font-display text-lg font-bold text-solo">
            {profile.displayName || 'Sem nome de exibição'}
          </h3>
          <p className="text-sm text-cinza">Membro Trade2Fly</p>

          {profile.city ? (
            <p className="mt-3 text-sm text-solo">📍 {profile.city}</p>
          ) : null}
          {profile.dropzone ? (
            <p className="mt-1 text-sm text-cinza">🪂 {profile.dropzone}</p>
          ) : null}

          {profile.bio ? (
            <p className="mt-4 text-left text-sm leading-relaxed text-solo">{profile.bio}</p>
          ) : (
            <p className="mt-4 text-sm text-cinza">Nenhuma bio adicionada ainda.</p>
          )}

          <p className="mt-4 text-xs text-cinza">{email}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Link to="/meus-anuncios" onClick={onClose}>
            <Button className="w-full sm:w-auto">Ver meus anúncios</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
