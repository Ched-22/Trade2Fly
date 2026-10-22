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

export function calcNetPayoutFromOrders(
  orders: { amount: number; commissionExempt?: boolean }[],
): number {
  return Math.round(
    orders.reduce((sum, order) => {
      const { netPayout } = calculateSellerPayout(order.amount, {
        commissionExempt: order.commissionExempt,
      });
      return sum + netPayout;
    }, 0) * 100,
  ) / 100;
}
