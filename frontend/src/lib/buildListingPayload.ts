import { getFieldsForCategory } from '../data/listingFieldConfig';
import type { ListingCondition, ListingFormState } from '../types/listingForm';

export type CreateListingPayload = {
  title: string;
  priceNum: number;
  specs: string;
  size?: string;
  jumps?: string;
  year?: string;
  weight?: string;
  brand: string;
  category: string;
  condition: ListingCondition;
  location: string;
  escrow: boolean;
  description: string;
};

function resolveBrand(form: ListingFormState): string {
  if (form.brand === '__other__') return form.brandOther.trim();
  return form.brand.trim();
}

export function buildSpecsString(form: ListingFormState): string {
  const parts: string[] = [];
  const fields = getFieldsForCategory(form.category);

  for (const field of fields) {
    const value = form[field.key]?.trim();
    if (!value) continue;

    switch (field.key) {
      case 'size':
        parts.push(
          form.category === 'Containers' || form.category === 'Capacetes e Equipamentos'
            ? value
            : `${value} sqft`,
        );
        break;
      case 'jumps':
        parts.push(`${value} saltos`);
        break;
      case 'year':
        parts.push(value);
        break;
      case 'weight':
        parts.push(`${value} kg`);
        break;
      case 'repackDate':
        parts.push(`repack ${value}`);
        break;
      case 'modelNotes':
        parts.push(value);
        break;
      default:
        break;
    }
  }

  return parts.join(' · ');
}

export function buildListingPayload(form: ListingFormState): CreateListingPayload {
  const brand = resolveBrand(form);
  const specs = buildSpecsString(form);

  return {
    title: form.title.trim(),
    priceNum: Number(form.priceNum),
    specs,
    size: form.size.trim() || undefined,
    jumps: form.jumps.trim() || undefined,
    year: form.year.trim() || undefined,
    weight: form.weight.trim() || undefined,
    brand,
    category: form.category,
    condition: form.condition as ListingCondition,
    location: form.location.trim(),
    escrow: true,
    description: form.description.trim(),
  };
}
