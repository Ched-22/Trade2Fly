import { Input } from '../ui/Input';
import { getFieldsForCategory } from '../../data/listingFieldConfig';
import type { ListingFormState } from '../../types/listingForm';

type CategoryFieldsPanelProps = {
  category: string;
  form: Pick<
    ListingFormState,
    'size' | 'jumps' | 'year' | 'weight' | 'repackDate' | 'modelNotes'
  >;
  errors: Partial<Record<keyof ListingFormState, string>>;
  onChange: (key: keyof ListingFormState, value: string) => void;
};

export function CategoryFieldsPanel({
  category,
  form,
  errors,
  onChange,
}: CategoryFieldsPanelProps) {
  const fields = getFieldsForCategory(category);
  if (!category || fields.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} id={`listing-field-${field.key}`}>
        <Input
          label={field.label}
          placeholder={field.placeholder}
          value={form[field.key]}
          onChange={(event) => onChange(field.key, event.target.value)}
          error={errors[field.key]}
        />
        </div>
      ))}
    </div>
  );
}
