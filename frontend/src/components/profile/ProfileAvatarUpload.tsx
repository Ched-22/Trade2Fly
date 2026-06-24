import { useRef } from 'react';
import { cn } from '../../lib/cn';
import { validateAvatarFile } from '../../lib/profileValidation';

type ProfileAvatarUploadProps = {
  avatarUrl: string | null;
  initials: string;
  error?: string;
  onChange: (avatarUrl: string | null) => void;
  onError: (message: string | null) => void;
};

export function ProfileAvatarUpload({
  avatarUrl,
  initials,
  error,
  onChange,
  onError,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }
    onError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors hover:border-voo',
          error ? 'border-error' : 'border-nuvem',
        )}
        aria-label="Adicionar foto de perfil"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-xs leading-snug text-cinza">+ Adicione sua foto de perfil…</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = '';
        }}
      />

      <p className="mt-3 text-sm text-cinza">
        Dica: use uma foto em que seu rosto seja reconhecível.
      </p>
      <p className="mt-1 text-xs text-cinza/80">.JPG, .PNG, .WebP (até 500 KB)</p>

      {avatarUrl ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            onError(null);
          }}
          className="mt-2 cursor-pointer text-sm font-medium text-voo hover:underline"
        >
          Remover foto
        </button>
      ) : null}

      {error ? <span className="mt-2 text-xs text-error">{error}</span> : null}

      {!avatarUrl && initials ? (
        <span className="sr-only">Iniciais: {initials}</span>
      ) : null}
    </div>
  );
}
