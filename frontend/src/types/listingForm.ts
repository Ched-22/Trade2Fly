export type ListingCondition = 'Novo' | 'Bom' | 'Usado';

export type ListingPhoto = {
  file?: File;
  previewUrl: string;
};

export type ListingFormState = {
  photos: ListingPhoto[];
  title: string;
  brand: string;
  brandOther: string;
  category: string;
  size: string;
  jumps: string;
  year: string;
  weight: string;
  repackDate: string;
  modelNotes: string;
  condition: ListingCondition | '';
  priceNum: string;
  location: string;
  escrow: boolean;
  description: string;
};

export const emptyListingForm = (): ListingFormState => ({
  photos: [],
  title: '',
  brand: '',
  brandOther: '',
  category: '',
  size: '',
  jumps: '',
  year: '',
  weight: '',
  repackDate: '',
  modelNotes: '',
  condition: '',
  priceNum: '',
  location: '',
  escrow: true,
  description: '',
});
