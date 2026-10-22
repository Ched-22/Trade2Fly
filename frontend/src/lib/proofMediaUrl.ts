import { getToken } from './api';

/** Resolves proof file URLs from the API (relative /api/media/...) for img/video src. */
export function proofMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return appendOrderMediaToken(url);
  }
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const path = url.startsWith('/') ? url : `/${url}`;
  return appendOrderMediaToken(`${base}${path}`);
}

/** Order proof routes require JWT; <img>/<video> cannot send Authorization headers. */
function appendOrderMediaToken(url: string): string {
  if (!url.includes('/api/media/orders/')) return url;
  const token = getToken();
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(token)}`;
}
