import { Package, Truck } from 'lucide-react';
import type { OrderDetail } from '../../lib/ordersApi';
import { Button } from '../ui/Button';
import { ProofProgressSteps } from './ProofProgressSteps';
import { ProofUploadZone } from './ProofUploadZone';

type ShipmentProofKind = 'product_photo' | 'boxed_photo' | 'packing_video';

type ShipmentProofPanelProps = {
  order: OrderDetail;
  uploadingKind: ShipmentProofKind | null;
  deletingFileId?: number | null;
  actionLoading: boolean;
  onUpload: (kind: ShipmentProofKind, file: File) => Promise<void>;
  onDeleteFile: (fileId: number) => Promise<void>;
  onSubmit: () => Promise<void>;
};

export function ShipmentProofPanel({
  order,
  uploadingKind,
  deletingFileId = null,
  actionLoading,
  onUpload,
  onDeleteFile,
  onSubmit,
}: ShipmentProofPanelProps) {
  const shipment = order.fulfillment.shipmentProof;
  const hasProductPhotos = shipment.productPhotos.length > 0;
  const hasBoxedPhotos = shipment.boxedPhotos.length > 0;
  const hasPackingVideo = Boolean(shipment.packingVideo);
  const allComplete = hasProductPhotos && hasBoxedPhotos && hasPackingVideo;

  const steps = [
    { id: 'product', label: 'Fotos do produto', complete: hasProductPhotos },
    { id: 'boxed', label: 'Fotos na caixa', complete: hasBoxedPhotos },
    { id: 'video', label: 'Vídeo da embalagem', complete: hasPackingVideo },
  ];

  const handleFiles = async (kind: ShipmentProofKind, files: File[]) => {
    for (const file of files) {
      await onUpload(kind, file);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-nuvem bg-white shadow-sm">
      <div className="border-b border-nuvem bg-gradient-to-r from-bruma to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-voo-light">
            <Truck className="h-5 w-5 text-voo" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-solo">Provas de despacho</h2>
            <p className="mt-1 text-sm text-cinza">
              Registre o produto, a embalagem na caixa e um vídeo do empacotamento antes de enviar.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <ProofProgressSteps steps={steps} />

        <ProofUploadZone
          label="Fotos do produto"
          description="Mostre o equipamento antes de embalar — vários ângulos ajudam."
          accept="image/jpeg,image/png,image/webp"
          multiple
          mediaType="image"
          uploadedFiles={shipment.productPhotos}
          uploading={uploadingKind === 'product_photo'}
          deletingFileId={deletingFileId}
          complete={hasProductPhotos}
          onFilesSelected={(files) => handleFiles('product_photo', files)}
          onDeleteFile={onDeleteFile}
        />

        <ProofUploadZone
          label="Fotos na caixa"
          description="Produto dentro da caixa, com proteção visível."
          accept="image/jpeg,image/png,image/webp"
          multiple
          mediaType="image"
          uploadedFiles={shipment.boxedPhotos}
          uploading={uploadingKind === 'boxed_photo'}
          deletingFileId={deletingFileId}
          complete={hasBoxedPhotos}
          onFilesSelected={(files) => handleFiles('boxed_photo', files)}
          onDeleteFile={onDeleteFile}
          icon={<Package className="h-6 w-6 text-voo" />}
        />

        <ProofUploadZone
          label="Vídeo da embalagem"
          description="Grave fechando a caixa e mostrando o pacote pronto para envio."
          accept="video/mp4,video/webm"
          mediaType="video"
          uploadedFiles={shipment.packingVideo ? [shipment.packingVideo] : []}
          uploading={uploadingKind === 'packing_video'}
          deletingFileId={deletingFileId}
          complete={hasPackingVideo}
          onFilesSelected={(files) => handleFiles('packing_video', files)}
          onDeleteFile={onDeleteFile}
        />

        <div className="rounded-lg border border-nuvem bg-bruma/40 px-4 py-3 text-xs text-cinza">
          Essas provas protegem você e o comprador. Só submeta quando todas as etapas estiverem
          completas.
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={actionLoading || uploadingKind !== null || !allComplete}
          onClick={() => void onSubmit()}
        >
          Submeter despacho
        </Button>

        {!allComplete ? (
          <p className="text-xs text-cinza">
            Complete todas as etapas acima para liberar o envio.
          </p>
        ) : null}
      </div>
    </section>
  );
}
