export const ORDER_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: 'Aguardando pagamento',
  awaiting_shipment: 'Aguardando envio',
  shipment_in_progress: 'Preparando envio',
  shipped: 'Enviado',
  disputed: 'Em disputa',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export const COMPLETION_SOURCE_LABELS: Record<string, string> = {
  buyer_confirmed: 'Confirmado pelo comprador',
  auto_completed: 'Concluído automaticamente',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
