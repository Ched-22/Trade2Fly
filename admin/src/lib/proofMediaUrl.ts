import { getToken } from './api';

/** Order proof media requires JWT; img/video src use ?token=. */
export function proofMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return appendToken(url);
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return appendToken(path);
}

function appendToken(url: string): string {
  if (!url.includes('/api/media/orders/')) return url;
  const token = getToken();
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(token)}`;
}

export function marketplaceListingUrl(publicPath: string): string {
  const base = import.meta.env.VITE_MARKETPLACE_URL?.replace(/\/$/, '') ?? 'http://localhost:5173';
  const path = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
  return `${base}${path}`;
}
