import { apiGet } from './api';
import type { OrderDetail } from './ordersApi';

export type SellerSalesSummary = {
  periodDays: number;
  generatedAt: string;
  commission?: {
    firstSaleExempt: boolean;
    commissionPercent: number;
  };
  listings: {
    active: number;
    total: number;
  };
  orders: {
    active: number;
    completed: number;
    completedInPeriod: number;
    cancelled: number;
    pendingGmv: number;
  };
  revenue: {
    gmvCompleted: number;
    gmvCompletedInPeriod: number;
    netPayoutCompleted: number;
    netPayoutInPeriod: number;
    averageOrderValue: number;
  };
  charts: {
    salesByDay: { date: string; count: number; gmv: number }[];
  };
  recentCompleted: OrderDetail[];
};

export type SellerCommissionInfo = {
  firstSaleExempt: boolean;
  completedSales: number;
  commissionPercent: number;
};

export function getSellerSalesSummary(periodDays = 30): Promise<SellerSalesSummary> {
  return apiGet<SellerSalesSummary>(`/api/seller/sales-summary?periodDays=${periodDays}`);
}

export function getSellerCommissionInfo(): Promise<SellerCommissionInfo> {
  return apiGet<SellerCommissionInfo>('/api/seller/commission');
}
