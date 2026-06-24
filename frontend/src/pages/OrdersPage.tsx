import { listings } from '../data/mockListings';

const mockOrders = [
  { id: 'ord-001', listing: listings[0], status: 'Em custódia', date: '12 jun 2026' },
  { id: 'ord-002', listing: listings[7], status: 'Entregue', date: '3 mai 2026' },
];

export function OrdersPage() {
  return (
    <div className="t2f-page max-w-3xl">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Meus pedidos</h1>
      <p className="mb-8 text-cinza">Histórico de compras com pagamento protegido.</p>

      <div className="space-y-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-nuvem bg-white p-4"
          >
            <div
              className="h-16 w-16 shrink-0 rounded-lg"
              style={{ background: order.listing.grad }}
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{order.listing.title}</div>
              <div className="font-mono text-sm text-pull">{order.listing.price}</div>
              <div className="text-sm text-cinza">{order.date}</div>
            </div>
            <span className="rounded-full bg-liberado-light px-3 py-1 text-xs font-semibold text-liberado-dark">
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
