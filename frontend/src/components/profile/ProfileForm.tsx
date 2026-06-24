import { useState, type FormEvent } from 'react';
import { deriveDisplayName, deriveInitials } from '../../lib/profileStorage';
import {
  hasProfileErrors,
  validateProfileForm,
  type ProfileFormErrors,
} from '../../lib/profileValidation';
import type { ProfileData } from '../../types/profile';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';

type ProfileFormProps = {
  initialData: ProfileData;
  saving: boolean;
  onSubmit: (data: ProfileData) => Promise<void>;
  onCancel: () => void;
  onPreview: (data: ProfileData) => void;
};

export function ProfileForm({
  initialData,
  saving,
  onSubmit,
  onCancel,
  onPreview,
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileData>(initialData);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [useSuggestedName, setUseSuggestedName] = useState(true);

  const patch = (partial: Partial<ProfileData>) => {
    setForm((current) => ({ ...current, ...partial }));
  };

  const applySuggestedDisplayName = () => {
    patch({ displayName: deriveDisplayName(form.firstName, form.lastName) });
  };

  const handleNameBlur = () => {
    if (useSuggestedName) {
      applySuggestedDisplayName();
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateProfileForm(form);
    if (errors.avatar) {
      validationErrors.avatar = errors.avatar;
    }
    setErrors(validationErrors);
    if (hasProfileErrors(validationErrors)) return;
    await onSubmit(form);
  };

  const initials = deriveInitials(form.firstName, form.lastName);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileAvatarUpload
        avatarUrl={form.avatarUrl}
        initials={initials}
        error={errors.avatar}
        onChange={(avatarUrl) => patch({ avatarUrl })}
        onError={(message) =>
          setErrors((current) => {
            const next = { ...current };
            if (message) next.avatar = message;
            else delete next.avatar;
            return next;
          })
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Nome"
          value={form.firstName}
          onChange={(e) => patch({ firstName: e.target.value })}
          onBlur={handleNameBlur}
          error={errors.firstName}
        />
        <Input
          label="Sobrenome"
          value={form.lastName}
          onChange={(e) => patch({ lastName: e.target.value })}
          onBlur={handleNameBlur}
          error={errors.lastName}
        />
      </div>

      <div>
        <Input
          label="Nome de exibição"
          value={form.displayName}
          onChange={(e) => {
            setUseSuggestedName(false);
            patch({ displayName: e.target.value });
          }}
          error={errors.displayName}
        />
        <p className="mt-1.5 text-xs text-cinza">
          O nome de exibição pode ser gerado automaticamente a partir do nome e sobrenome.
        </p>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-solo">
          <input
            type="checkbox"
            checked={useSuggestedName}
            onChange={(e) => {
              setUseSuggestedName(e.target.checked);
              if (e.target.checked) applySuggestedDisplayName();
            }}
            className="h-4 w-4 accent-voo"
          />
          Usar sugestão automática
        </label>
      </div>

      <Textarea
        label="Bio"
        placeholder="Conte um pouco sobre você…"
        value={form.bio}
        onChange={(e) => patch({ bio: e.target.value })}
        error={errors.bio}
        maxLength={500}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onPreview(form)}
            disabled={saving}
          >
            Pré-visualizar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </form>
  );
}
