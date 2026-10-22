import { apiGet, apiPost } from './api';
import type { OrderDetail, OrderScope } from './ordersApi';
import { deleteOrderProof, uploadOrderProof } from './notificationsApi';

export type SellerOrdersResponse = {
  items: OrderDetail[];
  page: number;
  pageSize: number;
  total: number;
  commission?: {
    firstSaleExempt: boolean;
    commissionPercent: number;
  };
};

export function getSellerOrders(scope: OrderScope = 'active'): Promise<SellerOrdersResponse> {
  const params = new URLSearchParams({ scope });
  return apiGet<SellerOrdersResponse>(`/api/seller/orders?${params.toString()}`);
}

export function getSellerOrder(id: number): Promise<OrderDetail> {
  return apiGet<OrderDetail>(`/api/seller/orders/${id}`);
}

export function startShipment(orderId: number) {
  return apiPost<OrderDetail>(`/api/seller/orders/${orderId}/start-shipment`, {});
}

export function submitShipment(orderId: number) {
  return apiPost<OrderDetail>(`/api/seller/orders/${orderId}/submit-shipment`, {});
}

export { deleteOrderProof, uploadOrderProof };
