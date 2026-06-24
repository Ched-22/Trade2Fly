import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initialChatMessages } from '../data/mockChat';
import type { ChatMessage } from '../types/chat';
import { defaultFilters, type Filters, type Listing } from '../types/listing';
import { apiGet } from '../lib/api';

type ListingRaw = {
  id: number;
  title: string;
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
  sellerName: string;
  sellerId: string;
};

const GRAD_COLORS: [string, string, string][] = [
  ['#0D2B45', '#2D7DD2', '#3a8ee0'],
  ['#16456e', '#1FB98A', '#7EF0CC'],
  ['#0D2B45', '#16456e', '#2D7DD2'],
  ['#1a4a72', '#2D7DD2', '#9ecbf0'],
  ['#0D2B45', '#1FB98A', '#2D7DD2'],
  ['#16456e', '#2D7DD2', '#bcdcf6'],
  ['#1a4a72', '#16456e', '#2D7DD2'],
  ['#0D2B45', '#2D7DD2', '#7EF0CC'],
  ['#16456e', '#1a4a72', '#2D7DD2'],
  ['#0D2B45', '#16456e', '#1FB98A'],
  ['#1a4a72', '#2D7DD2', '#3a8ee0'],
  ['#16456e', '#2D7DD2', '#9ecbf0'],
];

function transformListing(raw: ListingRaw): Listing {
  const [a, b, c] = GRAD_COLORS[(raw.id - 1) % GRAD_COLORS.length];
  const grad = `linear-gradient(150deg, ${a}, ${b} 55%, ${c})`;
  const price = `R$ ${raw.priceNum.toLocaleString('pt-BR')}`;
  return {
    id: raw.id,
    title: raw.title,
    price,
    priceNum: raw.priceNum,
    specs: raw.specs ?? '',
    size: raw.size ?? '',
    jumps: raw.jumps ?? '',
    year: raw.year ?? '',
    weight: raw.weight ?? '',
    brand: raw.brand ?? '',
    category: raw.category,
    condition: raw.condition,
    location: raw.location,
    escrow: raw.escrow,
    seller: raw.sellerName,
    grad,
  };
}

type MarketplaceContextValue = {
  query: string;
  setQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  updateFilters: (patch: Partial<Filters>) => void;
  clearFilters: () => void;
  favorites: Record<number, boolean>;
  toggleFavorite: (id: number) => void;
  favCount: number;
  chatIdx: number;
  setChatIdx: (idx: number) => void;
  chatMsgs: Record<number, ChatMessage[]>;
  chatDraft: string;
  setChatDraft: (draft: string) => void;
  appendMessage: () => void;
  filteredListings: Listing[];
  allListings: Listing[];
  listingsLoading: boolean;
  selectedListingId: number | null;
  setSelectedListingId: (id: number | null) => void;
  checkoutListingId: number | null;
  setCheckoutListingId: (id: number | null) => void;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

function applyFilters(listings: Listing[], query: string, filters: Filters): Listing[] {
  const normalizedQuery = query.toLowerCase();
  let result = listings.filter((listing) => {
    if (
      normalizedQuery &&
      !listing.title.toLowerCase().includes(normalizedQuery) &&
      !listing.brand.toLowerCase().includes(normalizedQuery) &&
      !listing.category.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.brand && listing.brand !== filters.brand) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.escrow && !listing.escrow) return false;
    if (filters.min && listing.priceNum < Number(filters.min)) return false;
    if (filters.max && listing.priceNum > Number(filters.max)) return false;
    return true;
  });

  if (filters.sort === 'recentes') {
    result = [...result].sort((a, b) => b.id - a.id);
  } else if (filters.sort === 'menor') {
    result = [...result].sort((a, b) => a.priceNum - b.priceNum);
  } else if (filters.sort === 'maior') {
    result = [...result].sort((a, b) => b.priceNum - a.priceNum);
  }

  return result;
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [chatIdx, setChatIdx] = useState(0);
  const [chatMsgs, setChatMsgs] = useState(initialChatMessages);
  const [chatDraft, setChatDraft] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(1);
  const [checkoutListingId, setCheckoutListingId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<ListingRaw[]>('/api/listings')
      .then((data) => setAllListings(data.map(transformListing)))
      .catch(() => setAllListings([]))
      .finally(() => setListingsLoading(false));
  }, []);

  const updateFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setQuery('');
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((current) => {
      const next = { ...current };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const appendMessage = useCallback(() => {
    const draft = chatDraft.trim();
    if (!draft) return;
    setChatMsgs((current) => ({
      ...current,
      [chatIdx]: [...(current[chatIdx] ?? []), { me: true, text: draft }],
    }));
    setChatDraft('');
  }, [chatDraft, chatIdx]);

  const filteredListings = useMemo(
    () => applyFilters(allListings, query, filters),
    [allListings, query, filters],
  );

  const favCount = useMemo(() => Object.keys(favorites).length, [favorites]);

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      query,
      setQuery,
      filters,
      setFilters,
      updateFilters,
      clearFilters,
      favorites,
      toggleFavorite,
      favCount,
      chatIdx,
      setChatIdx,
      chatMsgs,
      chatDraft,
      setChatDraft,
      appendMessage,
      filteredListings,
      allListings,
      listingsLoading,
      selectedListingId,
      setSelectedListingId,
      checkoutListingId,
      setCheckoutListingId,
    }),
    [
      query,
      filters,
      updateFilters,
      clearFilters,
      favorites,
      toggleFavorite,
      favCount,
      chatIdx,
      chatMsgs,
      chatDraft,
      appendMessage,
      filteredListings,
      allListings,
      listingsLoading,
      selectedListingId,
      checkoutListingId,
    ],
  );

  return (
    <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplaceContext must be used within MarketplaceProvider');
  }
  return context;
}
