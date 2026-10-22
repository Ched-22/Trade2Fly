export const PLATFORM_FEE_PERCENT = 5;

export type SellerPayoutBreakdown = {
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  commissionExempt: boolean;
  commissionPercent: number;
};

export function calculateSellerPayout(
  grossAmount: number,
  options?: { commissionExempt?: boolean },
): SellerPayoutBreakdown {
  const commissionExempt = options?.commissionExempt === true;
  const commissionPercent = commissionExempt ? 0 : PLATFORM_FEE_PERCENT;
  const platformFee = commissionExempt
    ? 0
    : Math.round(grossAmount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const netPayout = Math.round((grossAmount - platformFee) * 100) / 100;
  return { grossAmount, platformFee, netPayout, commissionExempt, commissionPercent };
}

export const SELLER_PLATFORM_FEE_NOTICE =
  `A Trade2Fly cobra comissão de ${PLATFORM_FEE_PERCENT}% sobre o valor da venda, deduzida na liberação do pagamento ao vendedor. A primeira venda concluída de cada vendedor é isenta da comissão (permanecem as demais taxas, como frete e seguro frete).`;
