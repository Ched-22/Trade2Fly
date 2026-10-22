/**
 * Taxas de cartão de crédito cobradas pela Asaas (tabela padrão, ver .env.example) são sempre mais
 * altas que a taxa fixa do Pix (R$1,99). Em vez da Trade2Fly absorver essa diferença — em qualquer
 * parcelamento, incluindo à vista —, ela é repassada ao comprador como juros, para que o valor
 * líquido de comissão fique o mais parecido possível com o de uma compra via Pix, independente da
 * forma de pagamento escolhida.
 */
const ASAAS_PIX_FIXED_FEE = 1.99;

const ASAAS_CARD_FEE_AT_SIGHT = { rate: 0.0299, fixed: 0.49 };
const ASAAS_CARD_FEE_2_TO_6X = { rate: 0.0349, fixed: 0.49 };
const ASAAS_CARD_FEE_7_TO_12X = { rate: 0.0399, fixed: 0.49 };

export type CardChargeBreakdown = {
  /** Valor original do produto (base para comissão/repasse ao vendedor — nunca muda). */
  baseAmount: number;
  /** Valor efetivamente cobrado do comprador no cartão (base + juros). */
  chargeAmount: number;
  /** Juros repassados ao comprador (à vista ou parcelado). */
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
