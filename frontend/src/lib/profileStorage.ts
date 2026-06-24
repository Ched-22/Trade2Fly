import type { AuthUser } from '../context/AuthContext';
import type { ProfileData } from '../types/profile';
import { emptyProfile } from '../types/profile';

const profileKey = (userId: string) => `t2f_mock_profile_${userId}`;

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

function parseNameFromDisplayName(displayName: string): { firstName: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function getProfile(userId: string, user?: Pick<AuthUser, 'displayName'>): ProfileData {
  try {
    const raw = localStorage.getItem(profileKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as ProfileData;
      return { ...emptyProfile(), ...parsed };
    }
  } catch {
    // ignore corrupt storage
  }

  const base = emptyProfile();
  if (user?.displayName) {
    const { firstName, lastName } = parseNameFromDisplayName(user.displayName);
    base.firstName = firstName;
    base.lastName = lastName;
    base.displayName = user.displayName;
  }
  return base;
}

export type SaveProfileResult = {
  profile: ProfileData;
  sessionPatch: Pick<AuthUser, 'displayName' | 'initials' | 'avatarUrl'>;
};

/**
 * Single write path for profile data. Swap mock localStorage for apiPatch('/api/users/me') later.
 */
export async function saveProfile(userId: string, data: ProfileData): Promise<SaveProfileResult> {
  const profile: ProfileData = {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    displayName: data.displayName.trim(),
    phone: data.phone.trim(),
    bio: data.bio.trim(),
    city: data.city.trim(),
    dropzone: data.dropzone.trim(),
  };

  localStorage.setItem(profileKey(userId), JSON.stringify(profile));

  const sessionPatch = {
    displayName: profile.displayName,
    initials: deriveInitials(profile.firstName, profile.lastName),
    avatarUrl: profile.avatarUrl,
  };

  return { profile, sessionPatch };
}

export function getAvatarUrl(userId: string): string | null {
  return getProfile(userId).avatarUrl;
}
