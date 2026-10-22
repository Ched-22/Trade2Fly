import { Check, RefreshCw, X } from 'lucide-react';
import { formatPrice } from '../../lib/priceFormat';
import type { ChatMessage } from '../../types/chat';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

type OfferMessageBubbleProps = {
  message: ChatMessage;
  isMe: boolean;
  isPendingForMe: boolean;
  isAwaitingCounterpart?: boolean;
  onRespond?: () => void;
};

export function OfferMessageBubble({
  message,
  isMe,
  isPendingForMe,
  isAwaitingCounterpart = false,
  onRespond,
}: OfferMessageBubbleProps) {
  const type = message.messageType ?? 'text';
  const amount = message.offerAmount;

  if (type === 'offer_accepted' || type === 'offer_declined') {
    const accepted = type === 'offer_accepted';
    return (
      <div className="flex w-full justify-center px-2">
        <div
          className={cn(
            'max-w-[90%] rounded-xl border px-4 py-2.5 text-center text-sm',
            accepted
              ? 'border-liberado/30 bg-liberado-light/60 text-liberado-dark'
              : 'border-nuvem bg-bruma text-cinza',
          )}
        >
          <div className="flex items-center justify-center gap-1.5 font-semibold">
            {accepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {accepted ? 'Proposta aceita' : 'Proposta recusada'}
            {amount != null ? ` · ${formatPrice(amount)}` : ''}
          </div>
          <p className="mt-1 text-xs opacity-90">{message.text.replace(/^[✅❌]\s*/, '')}</p>
        </div>
      </div>
    );
  }

  const note = message.text.includes('\n\n')
    ? message.text.split('\n\n').slice(1).join('\n\n')
    : null;
  const isCounter = message.text.includes('Contraproposta');

  return (
    <div className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] overflow-hidden rounded-2xl border sm:max-w-[75%]',
          isMe ? 'border-pull/20 bg-pull text-white' : 'border-nuvem bg-white text-solo',
        )}
      >
        <div
          className={cn(
            'px-4 py-3',
            isMe ? 'bg-pull' : 'bg-gradient-to-br from-voo-light/80 to-white',
          )}
        >
          <p
            className={cn(
              'text-[11px] font-semibold tracking-wide uppercase',
              isMe ? 'text-white/80' : 'text-voo',
            )}
          >
            {isCounter ? 'Contraproposta' : 'Oferta'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold">
            {amount != null ? formatPrice(amount) : '—'}
          </p>
          {note ? (
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed whitespace-pre-line',
                isMe ? 'text-white/90' : 'text-cinza',
              )}
            >
              {note}
            </p>
          ) : null}
        </div>

        {isPendingForMe && onRespond ? (
          <div className={cn('flex flex-wrap gap-2 border-t px-3 py-2.5', isMe ? 'border-white/20' : 'border-nuvem')}>
            <Button
              type="button"
              size="sm"
              variant={isMe ? 'secondary' : 'primary'}
              className={cn(isMe && 'bg-white text-pull hover:bg-white/90')}
              onClick={onRespond}
            >
              Responder
            </Button>
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isMe ? 'text-white/80' : 'text-cinza',
              )}
            >
              <RefreshCw className="h-3 w-3" />
              Aceitar · Recusar · Contraproposta
            </span>
          </div>
        ) : null}

        {isAwaitingCounterpart ? (
          <div
            className={cn(
              'border-t px-3 py-2 text-xs',
              isMe ? 'border-white/20 text-white/75' : 'border-nuvem text-cinza',
            )}
          >
            Aguardando resposta…
          </div>
        ) : null}
      </div>
    </div>
  );
}
