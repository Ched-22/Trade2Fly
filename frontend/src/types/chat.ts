export type ChatThread = {
  id: number;
  otherUser: { id: string; name: string };
  listing: {
    id: number;
    title: string;
    priceNum: number;
    saleMode?: 'direct' | 'offersOnly';
    active?: boolean;
  };
  lastMessage: { text: string; createdAt: string } | null;
  createdAt: string;
  unread: boolean;
  isSeller: boolean;
  canReleaseCheckout?: boolean;
  canCompletePurchase?: boolean;
  checkoutAgreedPrice?: number;
  checkoutExpiresAt?: string;
};

export type ChatMessage = {
  id: number;
  threadId: number;
  senderId: string;
  text: string;
  messageType?: 'text' | 'offer' | 'offer_accepted' | 'offer_declined';
  offerAmount?: number | null;
  createdAt: string;
  sender: { id: string; displayName: string };
};

export type SendMessageResponse = {
  threadId: number;
  message: ChatMessage;
};

export type MessageCreatedEvent = {
  threadId: number;
  message: ChatMessage;
};

export type CheckoutUnlockedEvent = {
  listingId: number;
  threadId: number;
  agreedPrice: number;
  expiresAt: string;
};

export type CheckoutExpiredEvent = {
  listingId: number;
  threadId: number;
};

export type ListingSaleModeChangedEvent = {
  listingId: number;
  saleMode: 'direct' | 'offersOnly';
};

export type ThreadUpdatedEvent = {
  threadId: number;
  lastMessage: { text: string; createdAt: string };
  updatedAt: string;
};
