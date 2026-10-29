import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  confirmReturnReceived,
  getDisputeByOrder,
  getOrder,
  markReturnInTransit,
  replyToDispute,
  resolveDispute,
  setReturnLabel,
  type AdminDisputeDetail,
  type ReturnShippingPayer,
  type AdminOrderDetail,
  type AdminProofFile,
} from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';
import { marketplaceListingUrl, proofMediaUrl } from '../lib/proofMediaUrl';
import { orderStatusLabel } from '../lib/orderLabels';

function ProofGallery({
  title,
  files,
}: {
  title: string;
  files: (AdminProofFile | null | undefined)[];
}) {
  const items = files.filter((file): file is AdminProofFile => Boolean(file));
  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-nuvem bg-white p-4">
        <h2 className="mb-2 font-bold">{title}</h2>
        <p className="text-sm text-cinza">Nenhum arquivo.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-nuvem bg-white p-4">
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {items.map((file) => {
          const isVideo = file.mimeType.startsWith('video/');
          const src = proofMediaUrl(file.url);
          return (
            <a
              key={file.id}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="block w-28 overflow-hidden rounded-lg border border-nuvem bg-bruma"
            >
              {isVideo ? (
                <div className="flex aspect-square items-center justify-center text-xs font-semibold text-voo">
                  Vídeo
                </div>
              ) : (
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              )}
              <div className="truncate px-2 py-1 text-[10px] text-cinza">{file.kind}</div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

const OUTCOME_LABELS: Record<string, string> = {
  buyer_satisfied: 'Comprador confirmou que o problema foi resolvido',
  refund_buyer: 'Reembolsado ao comprador',
  release_seller: 'Liberado ao vendedor',
  return_and_refund: 'Devolução aprovada (reembolso após o recebimento do produto)',
};

const REASON_LABELS: Record<string, string> = {
  defect: 'Produto com defeito',
  not_as_described: 'Produto diferente do anunciado',
  withdrawal: 'Desistência (sem defeito)',
};

const RETURN_STATUS_LABELS: Record<string, string> = {
  awaiting_label: 'Aguardando etiqueta',
  label_issued: 'Etiqueta emitida',
  in_transit: 'Em trânsito',
  received: 'Recebida',
  refunded: 'Reembolsada',
  cancelled: 'Cancelada',
};

function ReturnSection({
  dispute,
  onChange,
}: {
  dispute: AdminDisputeDetail;
  onChange: (next: AdminDisputeDetail) => void;
}) {
  const orderReturn = dispute.return;
  const [trackingCode, setTrackingCode] = useState(orderReturn?.trackingCode ?? '');
  const [labelUrl, setLabelUrl] = useState(orderReturn?.labelUrl ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!orderReturn) return null;

  const orderId = dispute.orderId;
  const run = async (action: () => Promise<AdminDisputeDetail>) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusy(false);
    }
  };

  const canRegisterLabel =
    orderReturn.status === 'awaiting_label' || orderReturn.status === 'label_issued';
  const canReceive = orderReturn.status === 'label_issued' || orderReturn.status === 'in_transit';

  const handleReceived = () => {
    const question =
      orderReturn.shippingPayer === 'buyer'
        ? `Confirmar o recebimento e reembolsar ${formatPrice(orderReturn.refundAmount)} ao comprador (frete de volta descontado)? Não pode ser desfeito.`
        : 'Confirmar o recebimento e reembolsar integralmente o comprador? Não pode ser desfeito.';
    if (window.confirm(question)) void run(() => confirmReturnReceived(orderId));
  };

  return (
    <section className="space-y-3 rounded-xl border border-voo/30 bg-voo/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-solo">Devolução do produto</h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-solo">
          {RETURN_STATUS_LABELS[orderReturn.status]}
        </span>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase text-cinza">Frete de volta</div>
          <div className="font-mono font-bold">{formatPrice(orderReturn.shippingCost)}</div>
          <div className="text-xs text-cinza">
            Pago pelo {orderReturn.shippingPayer === 'seller' ? 'vendedor' : 'comprador'}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-cinza">Reembolso ao comprador</div>
          <div className="font-mono font-bold">{formatPrice(orderReturn.refundAmount)}</div>
        </div>
        {orderReturn.shippingPayer === 'seller' ? (
          <div>
            <div className="text-xs uppercase text-cinza">Débito do vendedor</div>
            <div className="font-mono font-bold text-pull">
              {formatPrice(orderReturn.sellerDebtAmount)}
            </div>
            <div className="text-xs text-cinza">Cobrança ainda manual (em aberto).</div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-pull/30 bg-pull/5 px-3 py-2 text-sm text-pull">
          {error}
        </p>
      ) : null}

      {canRegisterLabel ? (
        <div className="space-y-2 border-t border-voo/20 pt-3">
          <p className="text-xs text-cinza">
            Etiqueta reversa manual — a geração automática virá com a integração da Loggi.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              placeholder="Código de rastreio"
              className="rounded-md border border-nuvem p-2 text-sm"
            />
            <input
              value={labelUrl}
              onChange={(event) => setLabelUrl(event.target.value)}
              placeholder="Link da etiqueta"
              className="rounded-md border border-nuvem p-2 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => setReturnLabel(orderId, trackingCode, labelUrl))}
            className="cursor-pointer rounded-lg bg-voo px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Registrar etiqueta
          </button>
        </div>
      ) : (
        <p className="text-sm text-cinza">
          {orderReturn.trackingCode ? `Rastreio: ${orderReturn.trackingCode}` : null}
          {orderReturn.labelUrl ? (
            <>
              {' · '}
              <a href={orderReturn.labelUrl} target="_blank" rel="noreferrer" className="text-voo underline">
                etiqueta
              </a>
            </>
          ) : null}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {orderReturn.status === 'label_issued' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => markReturnInTransit(orderId))}
            className="cursor-pointer rounded-lg border border-nuvem bg-white px-4 py-2 text-sm font-semibold hover:bg-bruma disabled:opacity-50"
          >
            Marcar em trânsito
          </button>
        ) : null}
        {canReceive ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleReceived}
            className="cursor-pointer rounded-lg bg-pull px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Confirmar recebimento e reembolsar
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DisputeConversation({
  dispute,
  onChange,
}: {
  dispute: AdminDisputeDetail;
  onChange: (next: AdminDisputeDetail) => void;
}) {
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const defaultPayer: ReturnShippingPayer = dispute.reason === 'withdrawal' ? 'buyer' : 'seller';
  const [payer, setPayer] = useState<ReturnShippingPayer>(defaultPayer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolved = dispute.status === 'resolved';
  const orderId = dispute.orderId;

  const run = async (action: () => Promise<AdminDisputeDetail>, onDone?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusy(false);
    }
  };

  const handleReply = () => {
    if (!reply.trim()) {
      setError('Escreva a resposta antes de enviar.');
      return;
    }
    void run(() => replyToDispute(orderId, reply), () => setReply(''));
  };

  const handleResolve = (outcome: 'refund_buyer' | 'release_seller' | 'return_and_refund') => {
    if (note.trim().length < 5) {
      setError('Escreva a justificativa da decisão (ela será enviada ao comprador).');
      return;
    }
    const question =
      outcome === 'refund_buyer'
        ? `Reembolsar ${formatPrice(dispute.order.amount)} ao comprador? Esta ação não pode ser desfeita.`
        : outcome === 'return_and_refund'
          ? `Aprovar a devolução do produto com o frete de volta pago pelo ${payer === 'buyer' ? 'COMPRADOR (descontado do reembolso)' : 'VENDEDOR'}? O reembolso só sai quando você confirmar o recebimento.`
          : 'Liberar o valor ao vendedor e concluir o pedido? Esta ação não pode ser desfeita.';
    if (!window.confirm(question)) return;
    void run(
      () => resolveDispute(orderId, outcome, note, outcome === 'return_and_refund' ? payer : undefined),
      () => setNote(''),
    );
  };

  return (
    <section className="space-y-4 rounded-xl border border-nuvem bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-solo">Conversa com o comprador</h2>
          <p className="text-xs text-cinza">Motivo: {REASON_LABELS[dispute.reason] ?? dispute.reason}</p>
        </div>
        <span className="rounded-full bg-bruma px-3 py-1 text-xs font-semibold text-solo">
          {dispute.status === 'awaiting_admin'
            ? 'Aguardando resposta nossa'
            : dispute.status === 'awaiting_buyer'
              ? 'Aguardando comprador'
              : 'Resolvida'}
        </span>
      </div>

      <ol className="space-y-3">
        {dispute.messages.map((message) => {
          const fromBuyer = message.authorType === 'buyer';
          return (
            <li
              key={message.id}
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                fromBuyer ? 'mr-auto bg-pull/10' : 'ml-auto bg-voo/10'
              }`}
            >
              <div className="mb-1 text-xs font-semibold text-cinza">
                {fromBuyer ? `Comprador (${dispute.order.buyer.displayName})` : 'Admin'} ·{' '}
                {formatDate(message.createdAt)}
              </div>
              <p className="whitespace-pre-wrap break-words text-solo">{message.body}</p>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="rounded-lg border border-pull/30 bg-pull/5 px-3 py-2 text-sm text-pull">
          {error}
        </p>
      ) : null}

      {resolved ? (
        <p className="rounded-lg border border-nuvem bg-bruma px-3 py-2 text-sm font-semibold">
          Disputa encerrada
          {dispute.outcome ? `: ${OUTCOME_LABELS[dispute.outcome]}` : ''}
          {dispute.resolvedAt ? ` em ${formatDate(dispute.resolvedAt)}` : ''}.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="admin-reply" className="block text-sm font-semibold">
              Responder ao comprador
            </label>
            <textarea
              id="admin-reply"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-md border border-nuvem p-3 text-sm"
              placeholder="O comprador será notificado e poderá dizer se o problema foi resolvido."
            />
            <button
              type="button"
              disabled={busy}
              onClick={handleReply}
              className="cursor-pointer rounded-lg bg-voo px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Enviar resposta
            </button>
          </div>

          <div className="space-y-2 border-t border-nuvem pt-4">
            <label htmlFor="admin-note" className="block text-sm font-semibold">
              Decisão final (encerra a disputa)
            </label>
            <textarea
              id="admin-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-md border border-nuvem p-3 text-sm"
              placeholder="Justificativa da decisão — será enviada ao comprador na conversa."
            />
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-nuvem bg-bruma p-3 text-sm">
              <span className="font-semibold">Devolução do produto — frete de volta pago pelo:</span>
              <select
                value={payer}
                onChange={(event) => setPayer(event.target.value as ReturnShippingPayer)}
                className="rounded-md border border-nuvem bg-white p-1.5 text-sm"
              >
                <option value="seller">Vendedor (defeito / diferente do anunciado)</option>
                <option value="buyer">Comprador (desistência sem defeito)</option>
              </select>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleResolve('return_and_refund')}
                className="cursor-pointer rounded-lg bg-voo px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Aprovar devolução
              </button>
              {dispute.order.deliveryMode === 'pickup' ? (
                <span className="text-xs text-cinza">Retirada em mãos: sem frete de volta.</span>
              ) : (
                <span className="text-xs text-cinza">
                  Frete de volta estimado: {formatPrice(dispute.order.shippingAmount)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleResolve('refund_buyer')}
                className="cursor-pointer rounded-lg bg-pull px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Reembolsar comprador
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleResolve('release_seller')}
                className="cursor-pointer rounded-lg border border-nuvem bg-white px-4 py-2 text-sm font-semibold hover:bg-bruma disabled:opacity-50"
              >
                Liberar para o vendedor
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function DisputeDetailPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const [data, setData] = useState<AdminOrderDetail | null>(null);
  const [dispute, setDispute] = useState<AdminDisputeDetail | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    getOrder(id).then(setData).catch(() => setData(null));
    getDisputeByOrder(id).then(setDispute).catch(() => setDispute(null));
  }, [id]);

  const handleDisputeChange = (next: AdminDisputeDetail) => {
    setDispute(next);
    getOrder(id).then(setData).catch(() => undefined);
  };

  if (!data) {
    return <p className="text-cinza">Carregando disputa…</p>;
  }

  const { order, buyer, listing, fulfillment, proofFiles } = data;
  const publicPath = listing.publicPath ?? `/anuncio/${listing.id}`;
  const listingUrl = marketplaceListingUrl(publicPath);
  const shipment = fulfillment?.shipmentProof;
  const receipt = fulfillment?.receiptProof;

  return (
    <div className="space-y-6">
      <Link to="/disputas" className="text-sm font-semibold text-voo">
        ← Voltar às disputas
      </Link>

      <div className="rounded-xl border border-nuvem bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Disputa · Pedido #{order.id}</h1>
            <p className="mt-1 text-cinza">{listing.title}</p>
            <a
              href={listingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-voo hover:underline"
            >
              Ver anúncio no marketplace →
            </a>
          </div>
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt=""
              className="h-20 w-20 rounded-lg border border-nuvem object-cover"
            />
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs uppercase text-cinza">Status</div>
            <div className="font-semibold">{orderStatusLabel(order.status)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Valor</div>
            <div className="font-mono text-xl font-bold">{formatPrice(order.amount)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Despachado</div>
            <div>{order.shippedAt ? formatDate(order.shippedAt) : '—'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-cinza">Disputado em</div>
            <div>{order.disputedAt ? formatDate(order.disputedAt) : '—'}</div>
          </div>
        </div>
      </div>

      {dispute ? (
        <>
          <DisputeConversation dispute={dispute} onChange={handleDisputeChange} />
          <ReturnSection dispute={dispute} onChange={handleDisputeChange} />
        </>
      ) : (
        <section className="rounded-xl border border-pull/30 bg-pull/5 p-5">
          <h2 className="mb-2 font-bold text-solo">Reclamação do comprador</h2>
          <p className="whitespace-pre-wrap text-sm text-solo">
            {order.disputeReason?.trim() || 'Sem motivo informado.'}
          </p>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Comprador</h2>
          <Link to={`/usuarios/${buyer.id}`} className="font-semibold text-voo">
            {buyer.displayName}
          </Link>
          <p className="text-sm text-cinza">{buyer.email}</p>
        </section>
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Vendedor</h2>
          <Link to={`/usuarios/${listing.sellerId}`} className="font-semibold text-voo">
            {listing.sellerDisplayName}
          </Link>
          <p className="text-sm text-cinza">{listing.sellerEmail}</p>
        </section>
      </div>

      <ProofGallery
        title="Provas de despacho (vendedor)"
        files={[
          ...(shipment?.productPhotos ?? []),
          ...(shipment?.boxedPhotos ?? []),
          shipment?.packingVideo,
        ]}
      />

      <ProofGallery
        title="Provas de recebimento (comprador)"
        files={[receipt?.unboxingVideo, ...(receipt?.receivedPhotos ?? [])]}
      />

      {!fulfillment && proofFiles.length > 0 ? (
        <ProofGallery title="Provas (lista)" files={proofFiles} />
      ) : null}

      <p className="text-sm text-cinza">
        Também em{' '}
        <Link to={`/pedidos/${order.id}`} className="text-voo hover:underline">
          pedido #{order.id}
        </Link>
        .
      </p>
    </div>
  );
}
