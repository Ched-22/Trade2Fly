import { SELLER_PLATFORM_FEE_NOTICE } from '../../lib/platformFee';

type SellerPlatformFeeNoticeProps = {
  className?: string;
  firstSaleExempt?: boolean;
};

export function SellerPlatformFeeNotice({
  className = '',
  firstSaleExempt = false,
}: SellerPlatformFeeNoticeProps) {
  return (
    <div
      className={`rounded-lg border border-voo/25 bg-voo/5 p-3 text-sm leading-relaxed text-solo ${className}`}
    >
      <span className="font-semibold">Comissão: </span>
      {firstSaleExempt
        ? 'Sua primeira venda concluída é isenta da comissão Trade2Fly. Depois disso, aplica-se a comissão padrão. Frete, seguro frete e taxas de pagamento não entram nessa isenção.'
        : SELLER_PLATFORM_FEE_NOTICE}
    </div>
  );
}
