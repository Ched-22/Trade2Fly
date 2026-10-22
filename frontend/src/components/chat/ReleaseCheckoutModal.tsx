import { useEffect, useState, type FormEvent } from 'react';
import { getSuggestedPrice } from '../../lib/checkoutGrantsApi';
import { getSellerCommissionInfo } from '../../lib/sellerSalesApi';
import { formatPrice } from '../../lib/priceFormat';
import { SellerPayoutBreakdown } from '../sell/SellerPayoutBreakdown';
import { SellerPlatformFeeNotice } from '../sell/SellerPlatformFeeNotice';
import { LegalDocumentLink } from '../legal/LegalDocumentLink';
import { PLATFORM_FEE_PERCENT } from '../../lib/platformFee';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type ReleaseCheckoutModalProps = {
  open: boolean;
  listingId: number;
  threadId: number;
  onClose: () => void;
  onSubmit: (agreedPrice: number) => Promise<void>;
};

export function ReleaseCheckoutModal({
  open,
  listingId,
  threadId,
  onClose,
  onSubmit,
}: ReleaseCheckoutModalProps) {
  const [agreedPrice, setAgreedPrice] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstSaleExempt, setFirstSaleExempt] = useState(false);

  useEffect(() => {
    if (!open) return;

    setAcknowledged(false);
    setError('');
    setLoading(true);

    getSuggestedPrice(threadId)
      .then((result) => {
        if (result.suggestedPrice != null) {
          setAgreedPrice(String(result.suggestedPrice));
        } else {
          setAgreedPrice('');
        }
      })
      .catch(() => setAgreedPrice(''))
      .finally(() => setLoading(false));

    getSellerCommissionInfo()
      .then((info) => setFirstSaleExempt(info.firstSaleExempt))
      .catch(() => setFirstSaleExempt(false));
  }, [open, threadId, listingId]);

  if (!open) return null;

  const agreedPriceNum = Number(agreedPrice);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const price = Number(agreedPrice);
    if (!price || price <= 0) {
      setError('Informe um valor acordado válido.');
      return;
    }
    if (!acknowledged) {
      setError('Confirme que leu e aceita o aviso antes de liberar.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(price);
      onClose();
    } catch {
      setError('Não foi possível liberar o pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="release-checkout-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-nuvem bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="release-checkout-title" className="font-display text-xl font-bold text-solo">
              Liberar pagamento
            </h2>
            <p className="mt-1 text-sm text-cinza">
              Informe o valor acordado com este comprador no chat. O comprador terá 1 hora para
              concluir o pagamento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-cinza hover:text-solo"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <Input
            label="Valor acordado (R$)"
            type="number"
            min={0.01}
            step="0.01"
            value={agreedPrice}
            onChange={(event) => {
              setAgreedPrice(event.target.value);
              setError('');
            }}
            disabled={loading}
            error={error && !acknowledged ? error : undefined}
          />

          {agreedPriceNum > 0 ? (
            <SellerPayoutBreakdown amount={agreedPriceNum} commissionExempt={firstSaleExempt} />
          ) : null}

          <SellerPlatformFeeNotice firstSaleExempt={firstSaleExempt} />

          <div className="rounded-lg border border-pull/20 bg-pull/5 p-3 text-xs leading-relaxed text-solo">
            O valor informado deve ser exatamente o negociado nesta conversa. Divergências podem
            resultar na recusa da transação e em medidas disciplinares na plataforma, incluindo
            banimento.
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-solo">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
                setError('');
              }}
              className="mt-1"
            />
            <span>
              Confirmo que o valor acordado ({agreedPrice ? formatPrice(Number(agreedPrice)) : '—'})
              corresponde ao negociado no chat, estou ciente da{' '}
              {firstSaleExempt
                ? 'isenção de comissão na 1ª venda'
                : `comissão de ${PLATFORM_FEE_PERCENT}%`}{' '}
              e aceito os <LegalDocumentLink documentId="vendedor" /> e os{' '}
              <LegalDocumentLink documentId="termos" /> aplicáveis a esta transação.
            </span>
          </label>

          {error && acknowledged ? <p className="text-sm text-pull">{error}</p> : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? 'Liberando…' : 'Liberar pagamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
