export type Listing = {
  id: number;
  title: string;
  price: string;
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
  seller: string;
  grad: string;
};

export type Filters = {
  category: string;
  brand: string;
  condition: string;
  escrow: boolean;
  min: string;
  max: string;
  sort: 'recentes' | 'menor' | 'maior';
};

export const defaultFilters: Filters = {
  category: '',
  brand: '',
  condition: '',
  escrow: false,
  min: '',
  max: '',
  sort: 'recentes',
};
