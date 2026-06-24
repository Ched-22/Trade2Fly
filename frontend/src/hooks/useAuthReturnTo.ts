import { useSearchParams } from 'react-router-dom';

export function useAuthReturnTo() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const suffix = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

  return { returnTo, suffix };
}

export function safeReturnPath(returnTo: string | null | undefined, fallback = '/'): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return fallback;
  }
  return returnTo;
}
