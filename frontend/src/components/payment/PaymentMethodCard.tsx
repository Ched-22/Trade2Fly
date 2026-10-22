import type { PaymentMethod } from '../../lib/paymentMethodsApi';
import { CARD_BRAND_LABELS, PIX_KEY_TYPE_LABELS } from '../../lib/paymentMethodsApi';

type PaymentMethodCardProps = {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (method: PaymentMethod) => void;
  busy?: boolean;
};

export function PaymentMethodCard({ method, onSetDefault, onRemove, busy }: PaymentMethodCardProps) {
  const title =
    method.type === 'card'
      ? `${CARD_BRAND_LABELS[method.brand] ?? method.brand} •••• ${method.last4}`
      : `Pix (${PIX_KEY_TYPE_LABELS[method.pixKeyType]})`;

  const subtitle =
    method.type === 'card'
      ? `Validade ${String(method.expMonth).padStart(2, '0')}/${method.expYear}`
      : method.pixKeyMasked;

  return (
    <div className="rounded-xl border border-nuvem bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-solo">{title}</span>
            {method.isDefault ? (
              <span className="rounded-full bg-voo/10 px-2.5 py-0.5 text-xs font-semibold text-voo">
                Padrão
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-cinza">{subtitle}</div>
          {method.holderName ? (
            <div className="mt-1 text-xs text-cinza">{method.holderName}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {!method.isDefault ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSetDefault(method.id)}
              className="cursor-pointer rounded-lg border border-nuvem bg-white px-3 py-1.5 text-xs font-semibold text-solo hover:bg-bruma disabled:opacity-50"
            >
              Definir padrão
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(method)}
            className="cursor-pointer rounded-lg border border-nuvem bg-white px-3 py-1.5 text-xs font-semibold text-pull hover:bg-red-50 disabled:opacity-50"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
