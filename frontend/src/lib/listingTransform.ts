import type { Listing } from '../types/listing';
import { getListingCoverPhoto } from './listingPhotoStorage';

export type ListingApiRaw = {
  id: number;
  title: string;
  priceNum: number;
  specs: string;
  size: string;
  jumps: string;
  year: string;
  weight: string;
  brand: string;
  category: string;
  condition: string;
  location: string;
  postalCode?: string | null;
  escrow: boolean;
  sellerName: string;
  sellerId: string;
  description?: string;
  imageUrls?: string[];
  createdAt?: string;
  saleMode?: 'direct' | 'offersOnly';
  active?: boolean;
  activeOrder?: { id: number; status: string } | null;
  checkoutGrant?: {
    canCheckout: boolean;
    agreedPrice: number;
    threadId: number;
    expiresAt: string;
    expired?: boolean;
  } | null;
};

// Placeholders sem foto: grafite e aço, sem cor saturada
const GRAD_COLORS: [string, string, string][] = [
  ['#0e1114', '#1d242b', '#2b3640'],
  ['#14181c', '#262d33', '#3a444d'],
  ['#0e1114', '#2b4a63', '#3d5f7a'],
  ['#181b1f', '#2a2f35', '#454c54'],
  ['#0e1114', '#232a30', '#4a5560'],
  ['#15191e', '#1b3347', '#2b4a63'],
  ['#1a1d21', '#2e3338', '#4b5157'],
  ['#0e1114', '#26211d', '#4a3f36'],
  ['#14181c', '#1f2a33', '#35495a'],
  ['#181b1f', '#2b2622', '#544a40'],
  ['#0e1114', '#20262c', '#3b4650'],
  ['#15191e', '#2a3139', '#47525d'],
];

export function gradForListingId(id: number): string {
  const safeId = Number.isFinite(id) && id > 0 ? Math.floor(id) : 1;
  const index =
    ((safeId - 1) % GRAD_COLORS.length + GRAD_COLORS.length) % GRAD_COLORS.length;
  const [a, b, c] = GRAD_COLORS[index] ?? GRAD_COLORS[0];
  return `linear-gradient(150deg, ${a}, ${b} 55%, ${c})`;
}

export function transformListingFromApi(raw: ListingApiRaw): Listing {
  const grad = gradForListingId(raw.id);
  const price = `R$ ${raw.priceNum.toLocaleString('pt-BR')}`;
  const imageUrls = raw.imageUrls ?? [];
  const coverFromApi = imageUrls[0];
  const coverFromStorage = getListingCoverPhoto(raw.id);
  return {
    id: raw.id,
    title: raw.title,
    price,
    priceNum: raw.priceNum,
    specs: raw.specs ?? '',
    size: raw.size ?? '',
    jumps: raw.jumps ?? '',
    year: raw.year ?? '',
    weight: raw.weight ?? '',
    brand: raw.brand ?? '',
    category: raw.category,
    condition: raw.condition,
    location: raw.location,
    postalCode: raw.postalCode ?? undefined,
    escrow: raw.escrow,
    seller: raw.sellerName,
    sellerId: raw.sellerId,
    grad,
    description: raw.description ?? '',
    imageUrls,
    coverPhotoUrl: coverFromApi ?? coverFromStorage,
    createdAt: raw.createdAt,
    saleMode: raw.saleMode ?? 'direct',
    active: raw.active ?? true,
    activeOrder: raw.activeOrder ?? null,
    checkoutGrant: raw.checkoutGrant ?? null,
  };
}

export function sortListingsByNewest(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.id - a.id;
  });
}
