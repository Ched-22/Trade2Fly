import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initialChatMessages, chatThreads as seedChatThreads } from '../data/mockChat';
import { formatPrice } from '../data/mockListings';
import { transformListingFromApi, type ListingApiRaw } from '../lib/listingTransform';
import { apiGet, apiPost, getToken } from '../lib/api';
import type { ChatMessage, ChatThreadMeta } from '../types/chat';
import { defaultFilters, type Filters, type Listing } from '../types/listing';
import { useAuthContext } from './AuthContext';

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
  sendOffer: (listing: Listing, offerAmount: number, message: string) => number;
  chatThreads: ChatThreadMeta[];
  filteredListings: Listing[];
  allListings: Listing[];
  listingsLoading: boolean;
  listingsError: string | null;
  dismissListingsError: () => void;
  refetchListings: () => Promise<void>;
  selectedListingId: number | null;
  setSelectedListingId: (id: number | null) => void;
  checkoutListingId: number | null;
  setCheckoutListingId: (id: number | null) => void;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

function listingTimestamp(listing: Listing): number {
  if (listing.createdAt) {
    return new Date(listing.createdAt).getTime();
  }
  return listing.id;
}

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
    result = [...result].sort((a, b) => listingTimestamp(b) - listingTimestamp(a));
  } else if (filters.sort === 'menor') {
    result = [...result].sort((a, b) => a.priceNum - b.priceNum);
  } else if (filters.sort === 'maior') {
    result = [...result].sort((a, b) => b.priceNum - a.priceNum);
  }

  return result;
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { loggedIn, authReady } = useAuthContext();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [chatThreads, setChatThreads] = useState<ChatThreadMeta[]>(seedChatThreads);
  const [chatIdx, setChatIdx] = useState(0);
  const [chatMsgs, setChatMsgs] = useState(initialChatMessages);
  const [chatDraft, setChatDraft] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(1);
  const [checkoutListingId, setCheckoutListingId] = useState<number | null>(null);

  const refetchListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const data = await apiGet<ListingApiRaw[]>('/api/listings');
      setAllListings(data.map(transformListingFromApi));
      setListingsError(null);
    } catch {
      setAllListings([]);
      setListingsError('Não foi possível carregar anúncios. Verifique se o backend está rodando.');
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const dismissListingsError = useCallback(() => {
    setListingsError(null);
  }, []);

  useEffect(() => {
    void refetchListings();
  }, [refetchListings]);

  const loadFavorites = useCallback(async () => {
    if (!getToken()) {
      setFavorites({});
      return;
    }
    try {
      const ids = await apiGet<number[]>('/api/favorites/ids');
      const record: Record<number, boolean> = {};
      ids.forEach((id) => {
        record[id] = true;
      });
      setFavorites(record);
    } catch {
      setFavorites({});
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    void loadFavorites();
  }, [authReady, loggedIn, loadFavorites]);

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

    if (!getToken()) return;

    void apiPost<{ favorited: boolean }>(`/api/favorites/${id}`, {}).then(
      (result) => {
        setFavorites((current) => {
          const next = { ...current };
          if (result.favorited) {
            next[id] = true;
          } else {
            delete next[id];
          }
          return next;
        });
      },
      () => {
        void loadFavorites();
      },
    );
  }, [loadFavorites]);

  const appendMessage = useCallback(() => {
    const draft = chatDraft.trim();
    if (!draft) return;
    setChatMsgs((current) => ({
      ...current,
      [chatIdx]: [...(current[chatIdx] ?? []), { me: true, text: draft }],
    }));
    setChatDraft('');
  }, [chatDraft, chatIdx]);

  const sendOffer = useCallback(
    (listing: Listing, offerAmount: number, message: string): number => {
      let threadIdx = chatThreads.findIndex(
        (thread) => thread.name === listing.seller || thread.item === listing.title,
      );

      if (threadIdx === -1) {
        threadIdx = chatThreads.length;
        const newThread: ChatThreadMeta = {
          name: listing.seller,
          item: listing.title,
          price: listing.price,
          time: 'Agora',
          grad: listing.grad,
        };
        setChatThreads((current) => [...current, newThread]);
        setChatMsgs((current) => ({ ...current, [threadIdx]: [] }));
      }

      const offerLine = `💰 Nova oferta: ${formatPrice(offerAmount)}`;
      const offerText = message ? `${offerLine}\n\n${message}` : offerLine;

      setChatMsgs((current) => ({
        ...current,
        [threadIdx]: [...(current[threadIdx] ?? []), { me: true, text: offerText }],
      }));
      setChatIdx(threadIdx);
      return threadIdx;
    },
    [chatThreads],
  );

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
      sendOffer,
      chatThreads,
      filteredListings,
      allListings,
      listingsLoading,
      listingsError,
      dismissListingsError,
      refetchListings,
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
      sendOffer,
      chatThreads,
      filteredListings,
      allListings,
      listingsLoading,
      listingsError,
      dismissListingsError,
      refetchListings,
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
