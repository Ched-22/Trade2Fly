export function isCheckoutGrantActive(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function formatCheckoutGrantRemaining(expiresAt: string, now = Date.now()): string {
  const remainingMs = new Date(expiresAt).getTime() - now;
  if (remainingMs <= 0) return 'expirado';

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  return `${totalMinutes} min`;
}
