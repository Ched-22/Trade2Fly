import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthAlert } from '../components/auth/AuthAlert';
import { OrderDatesBlock } from '../components/orders/OrderDatesBlock';
import { OrderDetailHeader } from '../components/orders/OrderDetailHeader';
import { OrderListingGallery } from '../components/orders/OrderListingGallery';
import { DisputePanel } from '../components/orders/DisputePanel';
import { OrderStatusTimeline } from '../components/orders/OrderStatusTimeline';
import { buildBuyerOrderTimeline } from '../components/orders/orderTimeline';
import { ReceiptProofPanel } from '../components/orders/ReceiptProofPanel';
import {
  deleteOrderProof,
  getOrder,
  submitReceiptDecision,
  uploadOrderProof,
  type DisputeReason,
  type OrderDetail,
} from '../lib/ordersApi';

type ReceiptProofKind = 'unboxing_video' | 'received_photo';

function StatusGuidance({ order }: { order: OrderDetail }) {
  if (order.status === 'awaiting_payment') {
    return (
      <AuthAlert variant="info">
        Aguardando confirmação do pagamento. Assim que for confirmado, o vendedor poderá despachar.
      </AuthAlert>
    );
  }
  if (order.status === 'awaiting_shipment') {
    return (
      <AuthAlert variant="info">
        Pedido confirmado. Aguardando o vendedor iniciar o despacho.
      </AuthAlert>
    );
  }
  if (order.status === 'shipment_in_progress') {
    return (
      <AuthAlert variant="info">
        O vendedor está preparando o envio. Você será avisado quando o pedido for despachado.
      </AuthAlert>
    );
  }
  if (order.status === 'shipped') {
    const shippedAt = order.shippedAt ?? order.fulfillment.shipmentProof.submittedAt;
    return (
      <AuthAlert variant="success">
        Pedido despachado
        {shippedAt
          ? ` em ${new Date(shippedAt).toLocaleDateString('pt-BR')}`
          : ''}
        . Ao receber, registre a desembalagem abaixo.
      </AuthAlert>
    );
  }
  if (order.status === 'completed') {
    return (
      <AuthAlert variant="success">
        Transação concluída
        {order.completedAt
          ? ` em ${new Date(order.completedAt).toLocaleDateString('pt-BR')}`
          : ''}
        .
      </AuthAlert>
    );
  }
  if (order.status === 'cancelled') {
    return <AuthAlert variant="error">Este pedido foi cancelado.</AuthAlert>;
  }
  if (order.status === 'disputed') {
    return (
      <AuthAlert variant="info">
        Disputa em análise pela equipe Trade2Fly. Acompanhe a conversa abaixo.
      </AuthAlert>
    );
  }
  if (order.status === 'return_in_progress') {
    return (
      <AuthAlert variant="info">
        Devolução aprovada. Acompanhe abaixo o envio do produto de volta; o reembolso é feito quando
        o vendedor receber o produto.
      </AuthAlert>
    );
  }
  if (order.status === 'refunded') {
    return <AuthAlert variant="success">O valor deste pedido foi reembolsado.</AuthAlert>;
  }
  return null;
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<ReceiptProofKind | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
      setError(null);
    } catch {
      setError('Pedido não encontrado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = async (kind: ReceiptProofKind, file: File) => {
    if (!order) return;
    setUploadingKind(kind);
    setError(null);
    try {
      await uploadOrderProof(order.id, kind, file, undefined, false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    } finally {
      setUploadingKind(null);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!order) return;
    setDeletingFileId(fileId);
    setError(null);
    try {
      setOrder(await deleteOrderProof(order.id, fileId, false));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o arquivo.');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleConfirm = async () => {
    if (!order) return;
    setActionLoading(true);
    setError(null);
    try {
      await submitReceiptDecision(order.id, 'confirm');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível confirmar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async (reasonType: DisputeReason, reason: string) => {
    if (!order) return;
    setActionLoading(true);
    setError(null);
    try {
      await submitReceiptDecision(order.id, 'dispute', reason, reasonType);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível contestar.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="t2f-page">Carregando…</div>;
  if (!order) {
    return (
      <div className="t2f-page max-w-2xl">
        <AuthAlert variant="error">{error ?? 'Pedido não encontrado.'}</AuthAlert>
        <Link to="/pedidos" className="mt-4 inline-block text-pull underline">
          Voltar aos pedidos
        </Link>
      </div>
    );
  }

  const timeline = buildBuyerOrderTimeline(order);

  return (
    <div className="t2f-page max-w-4xl space-y-8">
      <Link to="/pedidos" className="text-sm text-pull underline">
        ← Meus pedidos
      </Link>

      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <OrderListingGallery
          title={order.listing.title}
          imageUrl={order.listing.imageUrl}
          imageUrls={order.listing.imageUrls}
        />

        <div className="min-w-0 space-y-6">
          <OrderDetailHeader order={order} />
          <StatusGuidance order={order} />
          <OrderDatesBlock order={order} />
          <OrderStatusTimeline steps={timeline} />
        </div>
      </div>

      {order.status === 'shipped' ? (
        <ReceiptProofPanel
          order={order}
          uploadingKind={uploadingKind}
          deletingFileId={deletingFileId}
          actionLoading={actionLoading}
          onUpload={handleUpload}
          onDeleteFile={handleDeleteFile}
          onConfirm={handleConfirm}
          onDispute={handleDispute}
        />
      ) : null}

      {order.status === 'disputed' ||
      order.status === 'return_in_progress' ||
      order.status === 'refunded' ? (
        <DisputePanel orderId={order.id} onOrderChanged={() => void load()} />
      ) : null}
    </div>
  );
}
