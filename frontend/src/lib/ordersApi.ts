import { apiGet, apiPost } from './api';
import { deleteOrderProof, uploadOrderProof } from './notificationsApi';

export type OrderStatus =
  | 'awaiting_payment'
  | 'awaiting_shipment'
  | 'shipment_in_progress'
  | 'shipped'
  | 'disputed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type ProofFile = {
  id: number;
  kind: string;
  url: string;
  mimeType: string;
  createdAt: string;
};

export type OrderScope = 'active' | 'history' | 'all';

export type OrderListItem = {
  id: number;
  amount: number;
  paymentType: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string | null;
  shippedAt?: string | null;
  commissionExempt?: boolean;
  listing: {
    id: number;
    title: string;
    priceNum: number;
    location: string;
    category: string;
    imageUrl: string | null;
    imageUrls?: string[];
  };
};

export type OrderDetail = OrderListItem & {
  updatedAt?: string;
  buyer: { id: string; displayName: string };
  seller: { id: string; displayName: string };
  fulfillment: {
    shipmentProof: {
      productPhotos: ProofFile[];
      boxedPhotos: ProofFile[];
      packingVideo: ProofFile | null;
      submittedAt: string | null;
    };
    receiptProof: {
      unboxingVideo: ProofFile | null;
      receivedPhotos: ProofFile[];
      submittedAt: string | null;
    };
    buyerDecision: 'confirm' | 'dispute' | null;
    disputeReason: string | null;
    buyerConfirmedAt: string | null;
    disputedAt: string | null;
    autoCompleteAt: string | null;
  };
};

export type CreateOrderResponse = {
  id: number;
  buyerId: string;
  listingId: number;
  amount: number;
  chargeAmount: number | null;
  paymentType: string;
  status: OrderStatus;
  asaasPaymentStatus: string | null;
  pixPayload: string | null;
  pixQrCodeBase64: string | null;
  bankSlipUrl: string | null;
  invoiceUrl: string | null;
};

export type CreateOrderPayload = {
  listingId: number;
  paymentType: 'pix' | 'card' | 'boleto';
  amount: number;
  cpfCnpj: string;
  installments?: number;
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCcv?: string;
  cardHolderPostalCode?: string;
  cardHolderAddressNumber?: string;
  cardHolderPhone?: string;
};

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiPost<CreateOrderResponse>('/api/orders', payload);
}

export function getOrders(scope: OrderScope = 'active'): Promise<OrderListItem[]> {
  const params = new URLSearchParams();
  if (scope !== 'all') params.set('scope', scope);
  const qs = params.toString();
  return apiGet<OrderListItem[]>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export function getOrder(id: number): Promise<OrderDetail> {
  return apiGet<OrderDetail>(`/api/orders/${id}`);
}

export function submitReceiptDecision(
  orderId: number,
  decision: 'confirm' | 'dispute',
  reason?: string,
) {
  return apiPost<OrderDetail>(`/api/orders/${orderId}/receipt-decision`, { decision, reason });
}

export type DisputeStatus = 'awaiting_admin' | 'awaiting_buyer' | 'resolved';

export type DisputeOutcome = 'buyer_satisfied' | 'refund_buyer' | 'release_seller';

export type DisputeMessage = {
  id: number;
  authorType: 'buyer' | 'admin';
  body: string;
  createdAt: string;
};

export type OrderDispute = {
  id: number;
  orderId: number;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  openedAt: string;
  resolvedAt: string | null;
  messages: DisputeMessage[];
};

export function getOrderDispute(orderId: number): Promise<OrderDispute> {
  return apiGet<OrderDispute>(`/api/orders/${orderId}/dispute`);
}

export function replyToDispute(orderId: number, body: string): Promise<OrderDispute> {
  return apiPost<OrderDispute>(`/api/orders/${orderId}/dispute/reply`, { body });
}

export function confirmDisputeResolved(orderId: number): Promise<OrderDispute> {
  return apiPost<OrderDispute>(`/api/orders/${orderId}/dispute/confirm-resolved`, {});
}

export { deleteOrderProof, uploadOrderProof };

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: 'Aguardando pagamento',
  awaiting_shipment: 'Aguardando despacho',
  shipment_in_progress: 'Preparando envio',
  shipped: 'Despachado',
  disputed: 'Em disputa',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  pix: 'Pix',
  card: 'Cartão',
  boleto: 'Boleto',
};

export function paymentTypeLabel(paymentType: string): string {
  return PAYMENT_TYPE_LABELS[paymentType] ?? paymentType;
}
