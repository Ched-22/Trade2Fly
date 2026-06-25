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
  escrow: boolean;
  sellerName: string;
  sellerId: string;
  description?: string;
  imageUrls?: string[];
  createdAt?: string;
};

const GRAD_COLORS: [string, string, string][] = [
  ['#0D2B45', '#2D7DD2', '#3a8ee0'],
  ['#16456e', '#1FB98A', '#7EF0CC'],
  ['#0D2B45', '#16456e', '#2D7DD2'],
  ['#1a4a72', '#2D7DD2', '#9ecbf0'],
  ['#0D2B45', '#1FB98A', '#2D7DD2'],
  ['#16456e', '#2D7DD2', '#bcdcf6'],
  ['#1a4a72', '#16456e', '#2D7DD2'],
  ['#0D2B45', '#2D7DD2', '#7EF0CC'],
  ['#16456e', '#1a4a72', '#2D7DD2'],
  ['#0D2B45', '#16456e', '#1FB98A'],
  ['#1a4a72', '#2D7DD2', '#3a8ee0'],
  ['#16456e', '#2D7DD2', '#9ecbf0'],
];

export function transformListingFromApi(raw: ListingApiRaw): Listing {
  const [a, b, c] = GRAD_COLORS[(raw.id - 1) % GRAD_COLORS.length];
  const grad = `linear-gradient(150deg, ${a}, ${b} 55%, ${c})`;
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
    escrow: raw.escrow,
    seller: raw.sellerName,
    grad,
    description: raw.description ?? '',
    imageUrls,
    coverPhotoUrl: coverFromApi ?? coverFromStorage,
    createdAt: raw.createdAt,
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
