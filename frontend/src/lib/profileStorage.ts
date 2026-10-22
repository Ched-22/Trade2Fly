import { apiGet, apiPatch } from './api';
import type { AuthUser } from '../context/AuthContext';
import type { ProfileData } from '../types/profile';
import { emptyProfile } from '../types/profile';

export function deriveDisplayName(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first) return '';
  if (!last) return first;
  return `${first} ${last[0]}.`;
}

export function deriveInitials(firstName: string, lastName: string): string {
  const first = firstName.trim()[0] ?? '';
  const last = lastName.trim()[0] ?? '';
  const combined = `${first}${last}`.toUpperCase();
  return combined || '??';
}

type UserProfileResponse = {
  displayName: string;
  initials: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  city: string | null;
  dropzone: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

function parseNameFromDisplayName(displayName: string): { firstName: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function toProfileData(res: UserProfileResponse): ProfileData {
  const fallback =
    !res.firstName?.trim() && !res.lastName?.trim()
      ? parseNameFromDisplayName(res.displayName ?? '')
      : { firstName: '', lastName: '' };
  return {
    firstName: res.firstName?.trim() ? res.firstName : fallback.firstName,
    lastName: res.lastName?.trim() ? res.lastName : fallback.lastName,
    displayName: res.displayName ?? '',
    bio: res.bio ?? '',
    city: res.city ?? '',
    dropzone: res.dropzone ?? '',
    phone: res.phone ?? '',
    avatarUrl: res.avatarUrl,
  };
}

export async function getProfile(user?: Pick<AuthUser, 'displayName'>): Promise<ProfileData> {
  try {
    const res = await apiGet<UserProfileResponse>('/api/users/me');
    return toProfileData(res);
  } catch {
    const base = emptyProfile();
    if (user?.displayName) base.displayName = user.displayName;
    return base;
  }
}

export type SaveProfileResult = {
  profile: ProfileData;
  sessionPatch: Pick<AuthUser, 'displayName' | 'initials' | 'avatarUrl'>;
};

export async function saveProfile(data: ProfileData): Promise<SaveProfileResult> {
  const trimmed: ProfileData = {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    displayName: data.displayName.trim(),
    phone: data.phone.trim(),
    bio: data.bio.trim(),
    city: data.city.trim(),
    dropzone: data.dropzone.trim(),
  };

  const res = await apiPatch<UserProfileResponse>('/api/users/me', {
    firstName: trimmed.firstName,
    lastName: trimmed.lastName,
    displayName: trimmed.displayName,
    bio: trimmed.bio,
    city: trimmed.city,
    dropzone: trimmed.dropzone,
    phone: trimmed.phone,
    avatarUrl: trimmed.avatarUrl ?? undefined,
  });

  return {
    profile: toProfileData(res),
    sessionPatch: { displayName: res.displayName, initials: res.initials, avatarUrl: res.avatarUrl },
  };
}
