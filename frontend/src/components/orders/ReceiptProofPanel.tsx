import { useState } from 'react';
import { PackageCheck, ShieldCheck } from 'lucide-react';
import type { OrderDetail } from '../../lib/ordersApi';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ProofProgressSteps } from './ProofProgressSteps';
import { ProofUploadZone } from './ProofUploadZone';

type ReceiptProofKind = 'unboxing_video' | 'received_photo';

type ReceiptProofPanelProps = {
  order: OrderDetail;
  uploadingKind: ReceiptProofKind | null;
  deletingFileId?: number | null;
  actionLoading: boolean;
  onUpload: (kind: ReceiptProofKind, file: File) => Promise<void>;
  onDeleteFile: (fileId: number) => Promise<void>;
  onConfirm: () => Promise<void>;
  onDispute: (reason: string) => Promise<void>;
};

export function ReceiptProofPanel({
  order,
  uploadingKind,
  deletingFileId = null,
  actionLoading,
  onUpload,
  onDeleteFile,
  onConfirm,
  onDispute,
}: ReceiptProofPanelProps) {
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeError, setDisputeError] = useState<string | null>(null);

  const receipt = order.fulfillment.receiptProof;
  const hasUnboxingVideo = Boolean(receipt.unboxingVideo);
  const hasReceivedPhotos = receipt.receivedPhotos.length > 0;
  const allComplete = hasUnboxingVideo && hasReceivedPhotos;

  const steps = [
    { id: 'video', label: 'Vídeo de desembalagem', complete: hasUnboxingVideo },
    { id: 'photos', label: 'Fotos do produto', complete: hasReceivedPhotos },
  ];

  const handleFiles = async (kind: ReceiptProofKind, files: File[]) => {
    for (const file of files) {
      await onUpload(kind, file);
    }
  };

  const handleDisputeSubmit = async () => {
    const trimmed = disputeReason.trim();
    if (trimmed.length < 10) {
      setDisputeError('Descreva o problema com pelo menos 10 caracteres.');
      return;
    }
    setDisputeError(null);
    await onDispute(trimmed);
    setShowDispute(false);
    setDisputeReason('');
  };

  return (
    <section className="overflow-hidden rounded-xl border border-nuvem bg-white shadow-sm">
      <div className="border-b border-nuvem bg-gradient-to-r from-bruma to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-liberado-light">
            <PackageCheck className="h-5 w-5 text-liberado-dark" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-solo">Comprovar recebimento</h2>
            <p className="mt-1 text-sm text-cinza">
              Registre a desembalagem e o estado do produto. Depois confirme ou conteste se houver
              divergência.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <ProofProgressSteps steps={steps} />

        <ProofUploadZone
          label="Vídeo de desembalagem"
          description="Grave abrindo a caixa e mostrando o conteúdo recebido."
          accept="video/mp4,video/webm"
          mediaType="video"
          uploadedFiles={receipt.unboxingVideo ? [receipt.unboxingVideo] : []}
          uploading={uploadingKind === 'unboxing_video'}
          deletingFileId={deletingFileId}
          complete={hasUnboxingVideo}
          onFilesSelected={(files) => handleFiles('unboxing_video', files)}
          onDeleteFile={onDeleteFile}
        />

        <ProofUploadZone
          label="Fotos do produto recebido"
          description="Detalhes, etiquetas, desgaste ou avarias visíveis."
          accept="image/jpeg,image/png,image/webp"
          multiple
          mediaType="image"
          uploadedFiles={receipt.receivedPhotos}
          uploading={uploadingKind === 'received_photo'}
          deletingFileId={deletingFileId}
          complete={hasReceivedPhotos}
          onFilesSelected={(files) => handleFiles('received_photo', files)}
          onDeleteFile={onDeleteFile}
        />

        {allComplete ? (
          <div className="rounded-xl border border-liberado/30 bg-liberado-light/40 p-4">
            <div className="mb-3 flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-liberado-dark" />
              <div>
                <p className="font-semibold text-solo">Provas enviadas</p>
                <p className="text-sm text-cinza">
                  Confirme se o produto está conforme o anúncio. O valor só é liberado ao vendedor
                  após sua confirmação.
                </p>
              </div>
            </div>

            {!showDispute ? (
              <div className="flex flex-wrap gap-3">
                <Button disabled={actionLoading} onClick={() => void onConfirm()}>
                  Confirmar produto recebido
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => {
                    setShowDispute(true);
                    setDisputeError(null);
                  }}
                >
                  Contestar produto
                </Button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-liberado/20 pt-4">
                <p className="rounded-lg bg-bruma px-3 py-2 text-xs text-cinza">
                  Escreva com o máximo de detalhes que puder. Anexe as fotos e vídeos corretamente —
                  eles serão analisados pela plataforma. As provas de recebimento já enviadas acima
                  entram na análise.
                </p>
                <label className="block text-sm font-semibold text-solo" htmlFor="dispute-reason">
                  Motivo da contestação
                </label>
                <Textarea
                  id="dispute-reason"
                  value={disputeReason}
                  onChange={(event) => {
                    setDisputeReason(event.target.value);
                    setDisputeError(null);
                  }}
                  placeholder="Descreva o que divergiu do anunciado (item errado, avaria, peças faltando…)"
                  rows={4}
                />
                {disputeError ? <p className="text-xs text-error">{disputeError}</p> : null}
                <div className="flex flex-wrap gap-3">
                  <Button variant="danger" disabled={actionLoading} onClick={() => void handleDisputeSubmit()}>
                    Enviar contestação
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={actionLoading}
                    onClick={() => {
                      setShowDispute(false);
                      setDisputeReason('');
                      setDisputeError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-cinza">
            Envie o vídeo e pelo menos uma foto antes de confirmar ou contestar.
          </p>
        )}

        {order.fulfillment.autoCompleteAt ? (
          <p className="rounded-lg bg-bruma px-3 py-2 text-xs text-cinza">
            Auto-conclusão em{' '}
            <span className="font-semibold text-solo">
              {new Date(order.fulfillment.autoCompleteAt).toLocaleDateString('pt-BR')}
            </span>{' '}
            se você não registrar uma decisão.
          </p>
        ) : null}
      </div>
    </section>
  );
}
