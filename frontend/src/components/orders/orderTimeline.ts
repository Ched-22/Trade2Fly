import type { OrderDetail, OrderStatus } from '../../lib/ordersApi';

export type OrderTimelineStepState = 'done' | 'current' | 'upcoming' | 'skipped';

export type OrderTimelineStep = {
  id: string;
  label: string;
  state: OrderTimelineStepState;
  dateLabel?: string | null;
};

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Timeline derived from order status + dates (no event table). */
export function buildBuyerOrderTimeline(order: OrderDetail): OrderTimelineStep[] {
  const shippedAt = order.shippedAt ?? order.fulfillment.shipmentProof.submittedAt;

  if (order.status === 'cancelled') {
    return [
      {
        id: 'placed',
        label: 'Pedido realizado',
        state: 'done',
        dateLabel: formatDate(order.createdAt),
      },
      { id: 'awaiting', label: 'Aguardando despacho', state: 'skipped' },
      { id: 'preparing', label: 'Preparando envio', state: 'skipped' },
      { id: 'shipped', label: 'Despachado', state: 'skipped' },
      { id: 'receipt', label: 'Recebimento / confirmação', state: 'skipped' },
      { id: 'terminal', label: 'Cancelado', state: 'current' },
    ];
  }

  const currentIndexByStatus: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
    refunded: 5,
    awaiting_payment: 0,
    awaiting_shipment: 1,
    shipment_in_progress: 2,
    shipped: 4,
    disputed: 5,
    return_in_progress: 5,
    completed: 5,
  };

  const currentIndex = currentIndexByStatus[order.status];
  const terminalLabel =
    order.status === 'disputed'
      ? 'Em disputa'
      : order.status === 'return_in_progress'
        ? 'Devolução em andamento'
        : order.status === 'completed'
        ? 'Concluído'
        : order.status === 'refunded'
          ? 'Reembolsado'
          : 'Conclusão';

  const raw: Omit<OrderTimelineStep, 'state'>[] = [
    {
      id: 'placed',
      label: 'Pedido realizado',
      dateLabel: formatDate(order.createdAt),
    },
    { id: 'awaiting', label: 'Aguardando despacho' },
    { id: 'preparing', label: 'Preparando envio' },
    {
      id: 'shipped',
      label: 'Despachado',
      dateLabel: formatDate(shippedAt),
    },
    {
      id: 'receipt',
      label: 'Recebimento / confirmação',
      dateLabel: formatDate(
        order.fulfillment.buyerConfirmedAt ?? order.fulfillment.disputedAt,
      ),
    },
    {
      id: 'terminal',
      label: terminalLabel,
      dateLabel: formatDate(order.completedAt ?? order.fulfillment.disputedAt),
    },
  ];

  const terminalDone =
    order.status === 'completed' ||
    order.status === 'disputed' ||
    order.status === 'return_in_progress' ||
    order.status === 'refunded';

  return raw.map((step, index) => {
    let state: OrderTimelineStepState;
    if (terminalDone) {
      state = index <= currentIndex ? 'done' : 'upcoming';
    } else if (index < currentIndex) {
      state = 'done';
    } else if (index === currentIndex) {
      state = 'current';
    } else {
      state = 'upcoming';
    }
    return { ...step, state };
  });
}
