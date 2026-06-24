export function validEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

export function validPassword(password: string): boolean {
  return password.length >= 8;
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function validDisplayName(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/).filter((part) => part.length > 0);
  return parts.length >= 2 && parts.every((part) => part.length >= 2);
}

export function deriveProfileFromFullName(fullName: string): {
  displayName: string;
  initials: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const displayName = parts[0] ?? fullName.trim();
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '??').toUpperCase();

  return { displayName, initials };
}
