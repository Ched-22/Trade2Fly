import type { OrderDetail } from '../../lib/ordersApi';

type OrderDatesBlockProps = {
  order: OrderDetail;
};

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function OrderDatesBlock({ order }: OrderDatesBlockProps) {
  const shippedAt = order.shippedAt ?? order.fulfillment.shipmentProof.submittedAt;
  const rows: { label: string; value: string }[] = [
    { label: 'Pedido', value: formatDateTime(order.createdAt) ?? '—' },
  ];

  if (shippedAt) {
    rows.push({ label: 'Despacho', value: formatDateTime(shippedAt) ?? '—' });
  }
  if (order.completedAt) {
    rows.push({ label: 'Conclusão', value: formatDateTime(order.completedAt) ?? '—' });
  }
  if (order.status === 'shipped' && order.fulfillment.autoCompleteAt) {
    rows.push({
      label: 'Auto-conclusão prevista',
      value: formatDateTime(order.fulfillment.autoCompleteAt) ?? '—',
    });
  }
  if (order.fulfillment.disputedAt) {
    rows.push({
      label: 'Contestação',
      value: formatDateTime(order.fulfillment.disputedAt) ?? '—',
    });
  }

  return (
    <section aria-label="Datas do pedido">
      <h2 className="mb-3 font-display text-lg font-bold text-solo">Datas</h2>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-cinza">{row.label}</dt>
            <dd className="font-medium text-solo">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
