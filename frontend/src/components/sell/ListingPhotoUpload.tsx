import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react';
import { validatePhotoFile } from '../../lib/listingFormValidation';
import type { ListingPhoto } from '../../types/listingForm';

const MAX_PHOTOS = 8;

type ListingPhotoUploadProps = {
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
  error?: string;
  onPhotoError: (message: string | null) => void;
};

export function ListingPhotoUpload({
  photos,
  onChange,
  error,
  onPhotoError,
}: ListingPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      onPhotoError(`Máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }

    const toAdd = Array.from(files).slice(0, remaining);
    const newPhotos: ListingPhoto[] = [];
    let pending = toAdd.length;

    for (const file of toAdd) {
      const validationError = validatePhotoFile(file);
      if (validationError) {
        onPhotoError(validationError);
        pending -= 1;
        if (pending === 0 && newPhotos.length > 0) {
          onChange([...photos, ...newPhotos]);
        }
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({ file, previewUrl });
      pending -= 1;
      if (pending === 0) {
        onPhotoError(null);
        onChange([...photos, ...newPhotos]);
      }
    }
  };

  const removePhoto = (index: number) => {
    const removed = photos[index];
    if (removed?.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    onChange(photos.filter((_, i) => i !== index));
    onPhotoError(null);
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={`${index}-${photo.previewUrl.slice(0, 24)}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-nuvem bg-nuvem/30"
          >
            <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
            {index === 0 ? (
              <span className="absolute top-2 left-2 rounded bg-solo/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                Capa
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                aria-label="Mover para esquerda"
                disabled={index === 0}
                onClick={() => movePhoto(index, -1)}
                className="cursor-pointer rounded bg-white/90 p-1 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Remover foto"
                onClick={() => removePhoto(index)}
                className="cursor-pointer rounded bg-white/90 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Mover para direita"
                disabled={index === photos.length - 1}
                onClick={() => movePhoto(index, 1)}
                className="cursor-pointer rounded bg-white/90 p-1 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-nuvem bg-white text-cinza transition-colors hover:border-voo hover:text-voo"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Adicionar foto</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <p className="text-xs text-cinza">
        A primeira foto é a capa do anúncio. JPG, PNG ou WebP — até 2 MB cada (máx. {MAX_PHOTOS}).
      </p>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
