import { apiDelete, apiGet, apiPatch, getToken } from './api';
import type { OrderDetail } from './ordersApi';

export type NotificationType =
  | 'order_purchased'
  | 'order_shipped'
  | 'order_completed'
  | 'order_auto_completed'
  | 'order_disputed'
  | 'dispute_admin_replied'
  | 'dispute_buyer_replied'
  | 'return_approved'
  | 'return_received'
  | 'checkout_available';

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  orderId: number | null;
  listingId: number | null;
  createdAt: string;
};

export type NotificationsResponse = {
  items: Notification[];
  page: number;
  pageSize: number;
  total: number;
  unreadCount: number;
};

export function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  if (params?.unreadOnly) search.set('unreadOnly', 'true');
  const qs = search.toString();
  return apiGet<NotificationsResponse>(`/api/notifications${qs ? `?${qs}` : ''}`);
}

export function getUnreadNotificationCount() {
  return apiGet<{ unreadCount: number }>('/api/notifications/unread-count');
}

export function markNotificationRead(id: number) {
  return apiPatch<Notification>(`/api/notifications/${id}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPatch<{ unreadCount: number }>('/api/notifications/read-all', {});
}

export async function uploadOrderProof(
  orderId: number,
  kind: string,
  file: File,
  durationSeconds?: number,
  seller = false,
): Promise<OrderDetail> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const form = new FormData();
  form.append('file', file);
  const params = new URLSearchParams({ kind });
  if (durationSeconds !== undefined) params.set('durationSeconds', String(durationSeconds));
  const prefix = seller ? '/api/seller/orders' : '/api/orders';
  const response = await fetch(`${baseUrl}${prefix}/${orderId}/proof-files?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: form,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body?.message ?? response.statusText);
  }
  return response.json() as Promise<OrderDetail>;
}

export function deleteOrderProof(
  orderId: number,
  proofFileId: number,
  seller = false,
): Promise<OrderDetail> {
  const prefix = seller ? '/api/seller/orders' : '/api/orders';
  return apiDelete<OrderDetail>(`${prefix}/${orderId}/proof-files/${proofFileId}`);
}
