import { useEffect, useState, type FormEvent } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { formatPrice } from '../../lib/priceFormat';
import { PLATFORM_FEE_PERCENT } from '../../lib/platformFee';
import { respondToOffer, type OfferResponseAction } from '../../lib/offersApi';
import { getSellerCommissionInfo } from '../../lib/sellerSalesApi';
import type { ChatMessage, ChatThread } from '../../types/chat';
import { LegalDocumentLink } from '../legal/LegalDocumentLink';
import { SellerPayoutBreakdown } from '../sell/SellerPayoutBreakdown';
import { SellerPlatformFeeNotice } from '../sell/SellerPlatformFeeNotice';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

type ModalView = 'choose' | 'counter' | 'accept';

type OfferRespondModalProps = {
  open: boolean;
  thread: ChatThread;
  offer: ChatMessage;
  isSeller: boolean;
  onClose: () => void;
  onResolved: () => Promise<void>;
};

export function OfferRespondModal({
  open,
  thread,
  offer,
  isSeller,
  onClose,
  onResolved,
}: OfferRespondModalProps) {
  const [view, setView] = useState<ModalView>('choose');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [firstSaleExempt, setFirstSaleExempt] = useState(false);

  const amount = offer.offerAmount ?? 0;

  useEffect(() => {
    if (!open) return;
    setView('choose');
    setCounterAmount(amount > 0 ? String(amount) : '');
    setCounterMessage('');
    setAcknowledged(false);
    setError('');
    setSubmitting(false);
    if (isSeller) {
      getSellerCommissionInfo()
        .then((info) => setFirstSaleExempt(info.firstSaleExempt))
        .catch(() => setFirstSaleExempt(false));
    }
  }, [open, offer.id, amount, isSeller]);

  if (!open) return null;

  const runAction = async (
    action: OfferResponseAction,
    extra?: { offerAmount?: number; text?: string; sellerAcknowledgedWarning?: boolean },
  ) => {
    setError('');
    setSubmitting(true);
    try {
      await respondToOffer(thread.listing.id, {
        threadId: thread.id,
        offerMessageId: offer.id,
        action,
        ...extra,
      });
      await onResolved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível processar a resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = () => void runAction('decline');

  const handleAccept = () => {
    if (isSeller) {
      setView('accept');
      return;
    }
    void runAction('accept');
  };

  const handleConfirmAccept = (event: FormEvent) => {
    event.preventDefault();
    if (!acknowledged) {
      setError('Confirme o aviso antes de aceitar e liberar o pagamento.');
      return;
    }
    void runAction('accept', { sellerAcknowledgedWarning: true });
  };

  const handleCounterSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = Number(counterAmount);
    if (!value || value <= 0) {
      setError('Informe um valor válido para a contraproposta.');
      return;
    }
    void runAction('counter', {
      offerAmount: value,
      text: counterMessage.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-respond-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-nuvem bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="offer-respond-title" className="font-display text-xl font-bold text-solo">
              {view === 'counter'
                ? 'Contraproposta'
                : view === 'accept'
                  ? 'Aceitar e liberar'
                  : 'Nova proposta'}
            </h2>
            <p className="mt-1 text-sm text-cinza">{thread.listing.title}</p>
            <p className="mt-1 text-sm text-cinza">
              De <span className="font-semibold text-solo">{thread.otherUser.name}</span>
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

        <div className="mb-5 rounded-xl border border-voo/20 bg-voo-light/50 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-voo uppercase">Valor proposto</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-solo">{formatPrice(amount)}</p>
          {offer.text.includes('\n\n') ? (
            <p className="mt-2 text-sm whitespace-pre-line text-cinza">
              {offer.text.split('\n\n').slice(1).join('\n\n')}
            </p>
          ) : null}
        </div>

        {view === 'choose' ? (
          <div className="space-y-3">
            <p className="text-sm text-cinza">
              {isSeller
                ? 'Aceite para liberar o pagamento neste valor, recuse ou envie uma contraproposta.'
                : 'Aceite a contraproposta, recuse ou envie um novo valor.'}
            </p>

            <Button
              type="button"
              className="w-full"
              disabled={submitting}
              onClick={handleAccept}
            >
              <Check className="h-4 w-4" />
              Aceitar {formatPrice(amount)}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={submitting}
              onClick={() => {
                setError('');
                setView('counter');
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Fazer contraproposta
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-error hover:bg-error/10"
              disabled={submitting}
              onClick={handleDecline}
            >
              <X className="h-4 w-4" />
              Recusar
            </Button>
          </div>
        ) : null}

        {view === 'counter' ? (
          <form onSubmit={handleCounterSubmit} className="space-y-4">
            <Input
              label="Seu valor (R$)"
              type="number"
              min={0.01}
              step="0.01"
              value={counterAmount}
              onChange={(event) => {
                setCounterAmount(event.target.value);
                setError('');
              }}
            />
            <Textarea
              label="Mensagem (opcional)"
              placeholder="Explique o valor da contraproposta…"
              value={counterMessage}
              onChange={(event) => setCounterMessage(event.target.value)}
              rows={3}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  setError('');
                  setView('choose');
                }}
              >
                Voltar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar contraproposta'}
              </Button>
            </div>
          </form>
        ) : null}

        {view === 'accept' ? (
          <form onSubmit={handleConfirmAccept} className="space-y-4">
            <p className="text-sm text-cinza">
              Ao aceitar, o pagamento será liberado para o comprador no valor de{' '}
              <span className="font-semibold text-solo">{formatPrice(amount)}</span> por 1 hora.
            </p>

            <SellerPayoutBreakdown amount={amount} commissionExempt={firstSaleExempt} />
            <SellerPlatformFeeNotice firstSaleExempt={firstSaleExempt} />

            <div className="rounded-lg border border-pull/20 bg-pull/5 p-3 text-xs leading-relaxed text-solo">
              O valor deve corresponder ao negociado nesta conversa. Divergências podem resultar na
              recusa da transação e em medidas disciplinares, incluindo banimento.
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
                Confirmo o valor acordado ({formatPrice(amount)}), a{' '}
                {firstSaleExempt
                  ? 'isenção de comissão na 1ª venda'
                  : `comissão de ${PLATFORM_FEE_PERCENT}%`}{' '}
                e aceito os <LegalDocumentLink documentId="vendedor" /> e os{' '}
                <LegalDocumentLink documentId="termos" />.
              </span>
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  setError('');
                  setView('choose');
                }}
              >
                Voltar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Liberando…' : 'Aceitar e liberar pagamento'}
              </Button>
            </div>
          </form>
        ) : null}

        {error ? <p className="mt-3 text-sm text-pull">{error}</p> : null}
      </div>
    </div>
  );
}
