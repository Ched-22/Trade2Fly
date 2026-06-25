import { getFieldsForCategory } from '../data/listingFieldConfig';
import type { ListingFormState } from '../types/listingForm';

export type ListingFormErrors = Partial<Record<keyof ListingFormState | 'submit', string>>;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS = 8;

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WebP.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return 'Cada foto deve ter no máximo 2 MB.';
  }
  return null;
}

export function validateListingForm(form: ListingFormState): ListingFormErrors {
  const errors: ListingFormErrors = {};

  if (form.photos.length < 1) {
    errors.photos = 'Adicione pelo menos uma foto.';
  }
  if (form.photos.length > MAX_PHOTOS) {
    errors.photos = `Máximo de ${MAX_PHOTOS} fotos.`;
  }

  if (form.title.trim().length < 10) {
    errors.title = 'O título deve ter pelo menos 10 caracteres.';
  }

  if (!form.brand) {
    errors.brand = 'Selecione uma marca.';
  } else if (form.brand === '__other__' && !form.brandOther.trim()) {
    errors.brandOther = 'Informe o nome da marca.';
  }

  if (!form.category) {
    errors.category = 'Selecione uma categoria.';
  } else {
    for (const field of getFieldsForCategory(form.category)) {
      if (field.required && !form[field.key]?.trim()) {
        errors[field.key] = `${field.label} é obrigatório.`;
      }
    }
  }

  if (!form.condition) {
    errors.condition = 'Selecione o estado do equipamento.';
  }

  const price = Number(form.priceNum);
  if (!form.priceNum.trim() || Number.isNaN(price) || price < 100) {
    errors.priceNum = 'Informe um preço válido (mínimo R$ 100).';
  }

  if (!form.location.trim()) {
    errors.location = 'Informe a localização (cidade e estado).';
  }

  if (form.description.trim().length < 50) {
    errors.description = 'A descrição deve ter pelo menos 50 caracteres.';
  }

  return errors;
}

export function hasFormErrors(errors: ListingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
