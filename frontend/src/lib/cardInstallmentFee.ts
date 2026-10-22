/**
 * Espelha backend/src/common/card-installment-fee.ts. A taxa de cartão da Asaas é sempre mais alta
 * que a taxa fixa do Pix (R$1,99), inclusive à vista — esse acréscimo é repassado ao comprador como
 * juros, exibido aqui antes do pagamento.
 */
const ASAAS_PIX_FIXED_FEE = 1.99;

const ASAAS_CARD_FEE_AT_SIGHT = { rate: 0.0299, fixed: 0.49 };
const ASAAS_CARD_FEE_2_TO_6X = { rate: 0.0349, fixed: 0.49 };
const ASAAS_CARD_FEE_7_TO_12X = { rate: 0.0399, fixed: 0.49 };

export type CardChargeBreakdown = {
  baseAmount: number;
  chargeAmount: number;
  buyerSurcharge: number;
};

export function calculateCardChargeTotal(baseAmount: number, installments: number): CardChargeBreakdown {
  const safeInstallments = installments && installments > 1 ? installments : 1;
  const tier =
    safeInstallments === 1
      ? ASAAS_CARD_FEE_AT_SIGHT
      : safeInstallments <= 6
        ? ASAAS_CARD_FEE_2_TO_6X
        : ASAAS_CARD_FEE_7_TO_12X;

  const targetCredited = baseAmount - ASAAS_PIX_FIXED_FEE;
  const chargeAmount = Math.round(((targetCredited + tier.fixed) / (1 - tier.rate)) * 100) / 100;
  const buyerSurcharge = Math.round((chargeAmount - baseAmount) * 100) / 100;

  return { baseAmount, chargeAmount, buyerSurcharge };
}
