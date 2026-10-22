import type { Notification } from './notificationsApi';

export function getNotificationLink(notification: Notification): string {
  if (notification.type === 'checkout_available' && notification.listingId) {
    return `/anuncio/${notification.listingId}`;
  }
  if (notification.type === 'order_purchased' || notification.type === 'order_disputed') {
    return `/vendas/pedidos/${notification.orderId}`;
  }
  if (notification.orderId) return `/pedidos/${notification.orderId}`;
  if (notification.listingId) return `/anuncio/${notification.listingId}`;
  return '/notificacoes';
}
