import { formatPrice } from '../../lib/priceFormat';
import { calculateSellerPayout, PLATFORM_FEE_PERCENT } from '../../lib/platformFee';

type SellerPayoutBreakdownProps = {
  amount: number;
  className?: string;
  compact?: boolean;
  commissionExempt?: boolean;
};

export function SellerPayoutBreakdown({
  amount,
  className = '',
  compact = false,
  commissionExempt = false,
}: SellerPayoutBreakdownProps) {
  if (!amount || amount <= 0) return null;

  const { grossAmount, platformFee, netPayout } = calculateSellerPayout(amount, {
    commissionExempt,
  });

  if (compact) {
    return (
      <p className={`text-xs text-cinza ${className}`}>
        Valor da venda {formatPrice(grossAmount)}
        {commissionExempt
          ? ` · comissão isenta (1ª venda)`
          : ` · comissão ${PLATFORM_FEE_PERCENT}% (${formatPrice(platformFee)})`}{' '}
        · você recebe <span className="font-semibold text-solo">{formatPrice(netPayout)}</span>
      </p>
    );
  }

  return (
    <div className={`rounded-lg border border-nuvem bg-bruma/40 p-3 text-sm ${className}`}>
      <div className="mb-2 font-semibold text-solo">Quanto você recebe</div>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-3 text-cinza">
          <span>Valor da venda</span>
          <span className="font-mono text-solo">{formatPrice(grossAmount)}</span>
        </div>
        <div className="flex justify-between gap-3 text-cinza">
          <span>
            {commissionExempt
              ? 'Comissão (1ª venda isenta)'
              : `Comissão (${PLATFORM_FEE_PERCENT}%)`}
          </span>
          <span className={`font-mono ${commissionExempt ? 'text-liberado-dark' : 'text-pull'}`}>
            {commissionExempt ? 'R$ 0' : `− ${formatPrice(platformFee)}`}
          </span>
        </div>
        <div className="flex justify-between gap-3 border-t border-nuvem pt-1.5 font-semibold text-solo">
          <span>Você recebe</span>
          <span className="font-mono text-liberado-dark">{formatPrice(netPayout)}</span>
        </div>
      </div>
      {commissionExempt ? (
        <p className="mt-2 text-xs text-liberado-dark">
          Sua primeira venda concluída é isenta da comissão Trade2Fly. Frete, seguro frete e taxas
          de pagamento continuam aplicando-se normalmente.
        </p>
      ) : null}
    </div>
  );
}
