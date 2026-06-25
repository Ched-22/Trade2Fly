import type { ListingFormState } from '../types/listingForm';
import { emptyListingForm } from '../types/listingForm';

const STORAGE_KEY = 'trade2fly:listingDraft:v1';
const WARN_SIZE_BYTES = 4 * 1024 * 1024;

export function estimateDraftSize(form: ListingFormState): number {
  return form.photos.reduce((sum, photo) => sum + photo.previewUrl.length, 0);
}

export function isDraftOversized(form: ListingFormState): boolean {
  return estimateDraftSize(form) > WARN_SIZE_BYTES;
}

export function loadListingDraft(): ListingFormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ListingFormState> & { photos?: unknown };
    const photos = Array.isArray(parsed.photos)
      ? parsed.photos.map((item) => {
          if (typeof item === 'string') return { previewUrl: item };
          if (item && typeof item === 'object' && 'previewUrl' in item) {
            return { previewUrl: String((item as { previewUrl: string }).previewUrl) };
          }
          return null;
        }).filter((item): item is { previewUrl: string } => item !== null)
      : [];
    return { ...emptyListingForm(), ...parsed, photos };
  } catch {
    return null;
  }
}

export function saveListingDraft(form: ListingFormState): void {
  try {
    const serializable = {
      ...form,
      photos: form.photos.map((photo) => photo.previewUrl),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearListingDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasListingDraft(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
