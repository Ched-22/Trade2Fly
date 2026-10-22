export type ListingSaleMode = 'direct' | 'offersOnly';

export type CheckoutGrantInfo = {
  canCheckout: boolean;
  agreedPrice: number;
  threadId: number;
  expiresAt: string;
  expired?: boolean;
};

export type ListingActiveOrder = {
  id: number;
  status: string;
};

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
  postalCode?: string;
  escrow: boolean;
  seller: string;
  sellerId: string;
  grad: string;
  description?: string;
  imageUrls?: string[];
  coverPhotoUrl?: string;
  createdAt?: string;
  saleMode?: ListingSaleMode;
  active?: boolean;
  activeOrder?: ListingActiveOrder | null;
  checkoutGrant?: CheckoutGrantInfo | null;
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
