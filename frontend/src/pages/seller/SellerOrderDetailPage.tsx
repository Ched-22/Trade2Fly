import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { ShipmentProofPanel } from '../../components/orders/ShipmentProofPanel';
import { OrderDatesBlock } from '../../components/orders/OrderDatesBlock';
import { OrderDetailHeader } from '../../components/orders/OrderDetailHeader';
import { OrderListingGallery } from '../../components/orders/OrderListingGallery';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';
import { buildBuyerOrderTimeline } from '../../components/orders/orderTimeline';
import type { OrderDetail } from '../../lib/ordersApi';
import {
  deleteOrderProof,
  getSellerOrder,
  startShipment,
  submitShipment,
  uploadOrderProof,
} from '../../lib/sellerOrdersApi';
import { SellerPayoutBreakdown } from '../../components/sell/SellerPayoutBreakdown';
import { SellerPlatformFeeNotice } from '../../components/sell/SellerPlatformFeeNotice';

type ShipmentProofKind = 'product_photo' | 'boxed_photo' | 'packing_video';

function StatusGuidance({ order }: { order: OrderDetail }) {
  switch (order.status) {
    case 'awaiting_payment':
      return <AuthAlert variant="info">Aguardando a confirmação do pagamento do comprador.</AuthAlert>;
    case 'awaiting_shipment':
      return <AuthAlert variant="info">Pagamento confirmado. Inicie o despacho do produto.</AuthAlert>;
    case 'shipment_in_progress':
      return (
        <AuthAlert variant="info">
          Envie as provas de despacho (fotos e vídeo) para concluir o envio.
        </AuthAlert>
      );
    case 'shipped':
      return <AuthAlert variant="success">Despacho enviado. Aguardando o comprador.</AuthAlert>;
    case 'disputed':
      return (
        <AuthAlert variant="error">
          O comprador abriu uma disputa sobre este produto. Vamos analisar o caso e retornaremos
          com uma resposta em até 48 horas úteis.
        </AuthAlert>
      );
    case 'refunded':
      return (
        <AuthAlert variant="info">
          A disputa foi resolvida a favor do comprador e o pedido foi reembolsado.
        </AuthAlert>
      );
    case 'completed':
      return (
        <AuthAlert variant="success">
          Transação concluída
          {order.completedAt ? ` em ${new Date(order.completedAt).toLocaleDateString('pt-BR')}` : ''}.
        </AuthAlert>
      );
    case 'cancelled':
      return <AuthAlert variant="error">Este pedido foi cancelado.</AuthAlert>;
    default:
      return null;
  }
}

export function SellerOrderDetailPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<ShipmentProofKind | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    setLoading(true);
    try {
      setOrder(await getSellerOrder(id));
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

  const handleStart = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      setOrder(await startShipment(order.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar despacho.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async (kind: ShipmentProofKind, file: File) => {
    if (!order) return;
    setUploadingKind(kind);
    setError(null);
    try {
      await uploadOrderProof(order.id, kind, file, undefined, true);
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
      setOrder(await deleteOrderProof(order.id, fileId, true));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o arquivo.');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleSubmit = async () => {
    if (!order) return;
    setActionLoading(true);
    setError(null);
    try {
      setOrder(await submitShipment(order.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Complete todas as provas antes de submeter.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="t2f-page">Carregando…</div>;
  if (!order) {
    return (
      <div className="t2f-page max-w-2xl">
        <AuthAlert variant="error">{error ?? 'Pedido não encontrado.'}</AuthAlert>
      </div>
    );
  }

  const timeline = buildBuyerOrderTimeline(order);

  return (
    <div className="t2f-page max-w-4xl space-y-8">
      <Link to="/vendas/pedidos" className="text-sm text-pull underline">
        ← Pedidos de venda
      </Link>

      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <OrderListingGallery
          title={order.listing.title}
          imageUrl={order.listing.imageUrl}
          imageUrls={order.listing.imageUrls}
        />

        <div className="min-w-0 space-y-6">
          <OrderDetailHeader order={order} viewer="seller" />
          <StatusGuidance order={order} />
          <OrderDatesBlock order={order} />
          <OrderStatusTimeline steps={timeline} />
        </div>
      </div>

      <div className="space-y-4">
        <SellerPayoutBreakdown
          amount={order.amount}
          commissionExempt={order.commissionExempt === true}
        />
        <SellerPlatformFeeNotice firstSaleExempt={order.commissionExempt === true} />
      </div>

      {order.status === 'awaiting_shipment' ? (
        <div>
          <Button disabled={actionLoading} onClick={() => void handleStart()}>
            Iniciar despacho
          </Button>
        </div>
      ) : null}

      {order.status === 'shipment_in_progress' ? (
        <ShipmentProofPanel
          order={order}
          uploadingKind={uploadingKind}
          deletingFileId={deletingFileId}
          actionLoading={actionLoading}
          onUpload={handleUpload}
          onDeleteFile={handleDeleteFile}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
