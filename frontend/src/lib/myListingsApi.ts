import { apiGet } from './api';
import { transformListingFromApi, type ListingApiRaw } from './listingTransform';
import type { Listing } from '../types/listing';

export type MyListingsFilter = 'true' | 'false' | 'all';

export function getMyListings(active: MyListingsFilter = 'true'): Promise<Listing[]> {
  const params = new URLSearchParams({ active });
  return apiGet<ListingApiRaw[]>(`/api/listings/me/listings?${params.toString()}`).then((data) =>
    data.map(transformListingFromApi),
  );
}
