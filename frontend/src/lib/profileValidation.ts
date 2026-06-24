import type { ProfileData } from '../types/profile';

export type ProfileFormErrors = Partial<Record<keyof ProfileData | 'avatar', string>>;

const AVATAR_MAX_BYTES = 500 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateProfileForm(data: ProfileData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (data.firstName.trim().length < 2) {
    errors.firstName = 'Informe seu nome.';
  }
  if (data.lastName.trim().length < 2) {
    errors.lastName = 'Informe seu sobrenome.';
  }
  if (data.displayName.trim().length < 2) {
    errors.displayName = 'Informe um nome de exibição.';
  }
  if (data.bio.length > 500) {
    errors.bio = 'A bio pode ter no máximo 500 caracteres.';
  }

  return errors;
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_TYPES.includes(file.type)) {
    return 'Use JPG, PNG ou WebP de até 500 KB.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Use JPG, PNG ou WebP de até 500 KB.';
  }
  return null;
}

export function hasProfileErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
