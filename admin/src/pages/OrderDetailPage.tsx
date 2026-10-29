import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, type AdminOrderDetail } from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';
import { COMPLETION_SOURCE_LABELS, orderStatusLabel } from '../lib/orderLabels';
import { marketplaceListingUrl, proofMediaUrl } from '../lib/proofMediaUrl';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const [data, setData] = useState<AdminOrderDetail | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    getOrder(id).then(setData).catch(() => setData(null));
  }, [id]);

  if (!data) {
    return <p className="text-cinza">Carregando pedido…</p>;
  }

  const { order, buyer, listing, proofFiles, fulfillment } = data;
  const publicPath = listing.publicPath ?? `/anuncio/${listing.id}`;

  return (
    <div className="space-y-6">
      <Link to="/pedidos" className="text-sm font-semibold text-voo">
        ← Voltar aos pedidos
      </Link>

      {order.status === 'disputed' || order.status === 'return_in_progress' ? (
        <Link to={`/disputas/${order.id}`} className="text-sm font-semibold text-pull hover:underline">
          Abrir na fila de Disputas →
        </Link>
      ) : null}

      <div className="rounded-xl border border-nuvem bg-white p-5">
        <h1 className="font-display text-2xl font-extrabold">Pedido #{order.id}</h1>
        <p className="mt-1 text-cinza">{listing.title}</p>
        <a
          href={marketplaceListingUrl(publicPath)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-voo hover:underline"
        >
          Ver anúncio no marketplace →
        </a>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs uppercase text-cinza">Valor</div>
            <div className="font-mono text-xl font-bold">{formatPrice(order.amount)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Status</div>
            <div className="font-semibold">{orderStatusLabel(order.status)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Pagamento</div>
            <div>{order.paymentType}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Criado em</div>
            <div>{formatDate(order.createdAt)}</div>
          </div>
        </div>
        {order.disputeReason ? (
          <div className="mt-4 rounded-lg border border-pull/30 bg-pull/5 p-3 text-sm">
            <div className="font-semibold">Contestação</div>
            <p className="mt-1 whitespace-pre-wrap">{order.disputeReason}</p>
            {order.disputedAt ? (
              <p className="mt-1 text-xs text-cinza">Em {formatDate(order.disputedAt)}</p>
            ) : null}
          </div>
        ) : null}
        {order.completedAt ? (
          <p className="mt-3 text-sm text-cinza">
            Concluído em {formatDate(order.completedAt)}
            {order.completionSource
              ? ` · ${COMPLETION_SOURCE_LABELS[order.completionSource]}`
              : ''}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Comprador</h2>
          <Link to={`/usuarios/${buyer.id}`} className="font-semibold text-voo">
            {buyer.displayName}
          </Link>
          <p className="text-sm text-cinza">{buyer.email}</p>
          <p className="mt-2 text-sm">Status: {buyer.active ? 'Ativo' : 'Inativo'}</p>
        </section>
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Vendedor</h2>
          <Link to={`/usuarios/${listing.sellerId}`} className="font-semibold text-voo">
            {listing.sellerDisplayName}
          </Link>
          <p className="text-sm text-cinza">{listing.sellerEmail}</p>
          <p className="mt-2 text-sm">Anúncio: {listing.title}</p>
          <p className="text-sm font-mono">{formatPrice(listing.priceNum)}</p>
        </section>
      </div>

      {fulfillment ? (
        <>
          <section className="rounded-xl border border-nuvem bg-white p-4">
            <h2 className="mb-3 font-bold">Provas de despacho</h2>
            <ul className="space-y-2 text-sm">
              {[
                ...fulfillment.shipmentProof.productPhotos,
                ...fulfillment.shipmentProof.boxedPhotos,
                fulfillment.shipmentProof.packingVideo,
              ]
                .filter(Boolean)
                .map((file) =>
                  file ? (
                    <li key={file.id} className="flex justify-between gap-3">
                      <span>{file.kind}</span>
                      <a
                        href={proofMediaUrl(file.url)}
                        className="text-voo hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver arquivo
                      </a>
                    </li>
                  ) : null,
                )}
            </ul>
          </section>
          <section className="rounded-xl border border-nuvem bg-white p-4">
            <h2 className="mb-3 font-bold">Provas de recebimento</h2>
            <ul className="space-y-2 text-sm">
              {[fulfillment.receiptProof.unboxingVideo, ...fulfillment.receiptProof.receivedPhotos]
                .filter(Boolean)
                .map((file) =>
                  file ? (
                    <li key={file.id} className="flex justify-between gap-3">
                      <span>{file.kind}</span>
                      <a
                        href={proofMediaUrl(file.url)}
                        className="text-voo hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver arquivo
                      </a>
                    </li>
                  ) : null,
                )}
            </ul>
          </section>
        </>
      ) : proofFiles.length > 0 ? (
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Provas</h2>
          <ul className="space-y-2 text-sm">
            {proofFiles.map((file) => (
              <li key={file.id} className="flex justify-between gap-3">
                <span>{file.kind}</span>
                <a
                  href={proofMediaUrl(file.url)}
                  className="text-voo hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver arquivo
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
