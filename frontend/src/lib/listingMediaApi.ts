import { ApiError, getToken } from './api';
import type { ListingPhoto } from '../types/listingForm';
import type { ListingApiRaw } from './listingTransform';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export async function resolvePhotoFiles(photos: ListingPhoto[]): Promise<File[]> {
  const files: File[] = [];
  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    if (photo.file) {
      files.push(photo.file);
      continue;
    }
    const response = await fetch(photo.previewUrl);
    const blob = await response.blob();
    const type = blob.type || 'image/jpeg';
    const extension = type.split('/')[1] || 'jpg';
    files.push(new File([blob], `photo-${index + 1}.${extension}`, { type }));
  }
  return files;
}

export async function uploadListingPhotos(
  listingId: number,
  files: File[],
): Promise<ListingApiRaw> {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const token = getToken();
  const response = await fetch(`${baseUrl}/api/listings/${listingId}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(body?.message ?? response.statusText, response.status);
  }

  return response.json() as Promise<ListingApiRaw>;
}
