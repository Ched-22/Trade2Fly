import { apiGet, apiPatch, apiPost, getToken, ApiError } from './api';

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  active: boolean;
  role: string;
  createdAt: string;
  listingsCount?: number;
  ordersCount?: number;
  violationsCount?: number;
};

export type AdminOrderListItem = {
  id: number;
  listingId: number;
  listingTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerDisplayName: string;
  sellerId: string;
  sellerEmail: string;
  sellerDisplayName: string;
  amount: number;
  paymentType: string;
  status: string;
  disputedAt?: string | null;
  disputeReason?: string | null;
  createdAt: string;
  completedAt: string | null;
  completionSource: 'buyer_confirmed' | 'auto_completed' | null;
};

export type AdminProofFile = {
  id: number;
  kind: string;
  mimeType: string;
  url: string;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type BuyerProfile = {
  stats: {
    ordersTotal: number;
    ordersCompleted: number;
    totalSpent: number;
  };
  recentOrders: AdminOrderListItem[];
};

export type SellerProfile = {
  stats: {
    listingsTotal: number;
    listingsActive: number;
    salesTotal: number;
    salesCompleted: number;
    gmvCompleted: number;
  };
  recentListings: {
    id: number;
    title: string;
    priceNum: number;
    active: boolean;
    createdAt: string;
  }[];
  recentSales: AdminOrderListItem[];
};

export type AdminUserDetail = {
  user: AdminUser & { initials: string; updatedAt: string };
  buyerProfile: BuyerProfile;
  sellerProfile: SellerProfile;
  recentViolations: Record<string, unknown>[];
};

export type CompletedSummary = {
  periodDays: number;
  completedCount: number;
  gmvCompleted: number;
  averageOrderValue: number;
  byDay: { date: string; count: number; gmv: number }[];
};

export type AdminOrderDetail = {
  order: {
    id: number;
    buyerId: string;
    listingId: number;
    amount: number;
    paymentType: string;
    status: string;
    shippedAt: string | null;
    buyerConfirmedAt: string | null;
    disputedAt: string | null;
    disputeReason: string | null;
    autoCompleteAt: string | null;
    completedAt: string | null;
    completionSource: 'buyer_confirmed' | 'auto_completed' | null;
    createdAt: string;
    updatedAt: string;
  };
  buyer: { id: string; email: string; displayName: string; active: boolean };
  listing: {
    id: number;
    title: string;
    priceNum: number;
    imageUrl?: string | null;
    publicPath?: string;
    sellerId: string;
    sellerEmail: string;
    sellerDisplayName: string;
  };
  fulfillment?: {
    shipmentProof: {
      productPhotos: AdminProofFile[];
      boxedPhotos: AdminProofFile[];
      packingVideo: AdminProofFile | null;
      submittedAt: string | null;
    };
    receiptProof: {
      unboxingVideo: AdminProofFile | null;
      receivedPhotos: AdminProofFile[];
      submittedAt: string | null;
    };
  };
  proofFiles: AdminProofFile[];
};

export type DashboardSummary = {
  generatedAt: string;
  periodDays: number;
  users: {
    total: number;
    active: number;
    inactive: number;
    newInPeriod: number;
    newToday: number;
  };
  listings: {
    total: number;
    active: number;
    inactive: number;
    offersOnly: number;
    direct: number;
    newInPeriod: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    gmvTotal: number;
    gmvInPeriod: number;
    averageOrderValue: number;
  };
  chat: {
    threadsTotal: number;
    messagesTotal: number;
    messagesInPeriod: number;
    offersInPeriod: number;
  };
  violations: {
    total: number;
    inPeriod: number;
    uniqueUsers: number;
  };
  charts: {
    signupsByDay: { date: string; count: number }[];
    ordersByDay: { date: string; count: number; gmv: number }[];
    listingsByCategory: { category: string; count: number }[];
    ordersByPaymentType: { paymentType: string; count: number }[];
  };
  recentActivity: {
    recentUsers: { id: string; email: string; displayName: string; createdAt: string }[];
    recentOrders: {
      id: number;
      listingTitle: string;
      buyerEmail: string;
      amount: number;
      createdAt: string;
    }[];
    recentViolations: {
      id: number;
      userId: string;
      listingId: number;
      attemptedAmount: number;
      agreedPrice: number;
      createdAt: string;
    }[];
    recentListings: {
      id: number;
      title: string;
      sellerEmail: string;
      priceNum: number;
      createdAt: string;
    }[];
  };
};

export function getDashboardSummary(periodDays = 30) {
  return apiGet<DashboardSummary>(`/api/admin/dashboard/summary?periodDays=${periodDays}`);
}

export function getUsers(params: URLSearchParams) {
  return apiGet<Paginated<AdminUser>>(`/api/admin/users?${params.toString()}`);
}

export function getUser(id: string) {
  return apiGet<AdminUserDetail>(`/api/admin/users/${id}`);
}

export function getUserOrders(userId: string, params: URLSearchParams) {
  return apiGet<Paginated<AdminOrderListItem>>(
    `/api/admin/users/${userId}/orders?${params.toString()}`,
  );
}

export function updateUserActive(id: string, active: boolean) {
  return apiPatch<AdminUser>(`/api/admin/users/${id}`, { active });
}

export function getListings(params: URLSearchParams) {
  return apiGet<Paginated<Record<string, unknown>>>(`/api/admin/listings?${params.toString()}`);
}

export function updateListingActive(id: number, active: boolean) {
  return apiPatch<{ id: number; title: string; active: boolean }>(`/api/admin/listings/${id}`, {
    active,
  });
}

export function getOrders(params: URLSearchParams) {
  return apiGet<Paginated<AdminOrderListItem>>(`/api/admin/orders?${params.toString()}`);
}

export function getOrder(id: number) {
  return apiGet<AdminOrderDetail>(`/api/admin/orders/${id}`);
}

export function getCompletedSummary(periodDays = 30, sellerId?: string) {
  const params = new URLSearchParams({ periodDays: String(periodDays) });
  if (sellerId) params.set('sellerId', sellerId);
  return apiGet<CompletedSummary>(`/api/admin/orders/completed-summary?${params.toString()}`);
}

export async function exportOrdersCsv(params: URLSearchParams): Promise<void> {
  const token = getToken();
  const response = await fetch(`/api/admin/orders/export?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    const message =
      typeof body?.message === 'string'
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join(', ')
          : response.statusText;
    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const filenameMatch = disposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? `trade2fly-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getViolations(params: URLSearchParams) {
  return apiGet<Paginated<Record<string, unknown>>>(
    `/api/admin/checkout-violations?${params.toString()}`,
  );
}

export type DisputeStatus = 'awaiting_admin' | 'awaiting_buyer' | 'resolved';
export type DisputeOutcome =
  | 'buyer_satisfied'
  | 'refund_buyer'
  | 'release_seller'
  | 'return_and_refund';
export type DisputeReason = 'defect' | 'not_as_described' | 'withdrawal';
export type ReturnShippingPayer = 'seller' | 'buyer';
export type ReturnStatus =
  | 'awaiting_label'
  | 'label_issued'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled';

export type AdminOrderReturn = {
  status: ReturnStatus;
  shippingPayer: ReturnShippingPayer;
  shippingCost: number;
  refundAmount: number;
  sellerDebtAmount: number;
  trackingCode: string | null;
  labelUrl: string | null;
  receivedAt: string | null;
  refundedAt: string | null;
};

export type DisputeMessage = {
  id: number;
  authorType: 'buyer' | 'admin';
  body: string;
  createdAt: string;
};

export type AdminDisputeListItem = {
  id: number;
  orderId: number;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  reason: DisputeReason;
  openedAt: string;
  lastBuyerMessageAt: string;
  resolvedAt: string | null;
  messageCount: number;
  lastMessage: { authorType: 'buyer' | 'admin'; body: string } | null;
  amount: number;
  listingTitle: string;
  buyer: { id: string; displayName: string };
  seller: { id: string; displayName: string };
};

export type AdminDisputeDetail = {
  id: number;
  orderId: number;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  reason: DisputeReason;
  return: AdminOrderReturn | null;
  openedAt: string;
  resolvedAt: string | null;
  lastBuyerMessageAt: string;
  messages: DisputeMessage[];
  order: {
    id: number;
    status: string;
    escrowStatus: string;
    amount: number;
    chargeAmount: number | null;
    shippingAmount: number;
    shippingInsurance: number;
    deliveryMode: 'shipping' | 'pickup';
    listingTitle: string;
    buyer: { id: string; displayName: string; email: string };
    seller: { id: string; displayName: string; email: string };
  };
};

export type DisputeListFilter = 'open' | DisputeStatus;

export function getDisputes(status: DisputeListFilter, page: number, pageSize: number) {
  const params = new URLSearchParams({ status, page: String(page), pageSize: String(pageSize) });
  return apiGet<Paginated<AdminDisputeListItem> & { pendingAdmin: number }>(
    `/api/admin/disputes?${params.toString()}`,
  );
}

export function getDisputeByOrder(orderId: number) {
  return apiGet<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}`);
}

export function replyToDispute(orderId: number, body: string) {
  return apiPost<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}/reply`, { body });
}

export function resolveDispute(
  orderId: number,
  outcome: 'refund_buyer' | 'release_seller' | 'return_and_refund',
  note: string,
  shippingPayer?: ReturnShippingPayer,
) {
  return apiPost<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}/resolve`, {
    outcome,
    note,
    shippingPayer,
  });
}

export function setReturnLabel(orderId: number, trackingCode?: string, labelUrl?: string) {
  return apiPost<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}/return/label`, {
    trackingCode: trackingCode || undefined,
    labelUrl: labelUrl || undefined,
  });
}

export function markReturnInTransit(orderId: number) {
  return apiPost<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}/return/in-transit`, {});
}

export function confirmReturnReceived(orderId: number) {
  return apiPost<AdminDisputeDetail>(`/api/admin/disputes/order/${orderId}/return/received`, {});
}
