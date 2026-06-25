const photosKey = (listingId: number) => `trade2fly:listingPhotos:v1:${listingId}`;

export function saveListingPhotos(listingId: number, photos: string[]): void {
  if (photos.length === 0) return;
  try {
    localStorage.setItem(photosKey(listingId), JSON.stringify(photos));
  } catch {
    // quota exceeded — photos won't persist locally
  }
}

export function getListingPhotos(listingId: number): string[] {
  try {
    const raw = localStorage.getItem(photosKey(listingId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getListingCoverPhoto(listingId: number): string | undefined {
  return getListingPhotos(listingId)[0];
}
