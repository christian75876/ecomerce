import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IDashboardSummary {
  totalProducts: number;
  lowStockProducts: number;
  salesToday: number;
  pendingOrders: number;
  salesByDay: Array<{
    label: string;
    total: number;
  }>;
  latestOrders: Array<{
    id: string;
    status: string;
    total: number;
    customerName: string;
  }>;
}

export type IDashboardSummaryResp = IApiResponse<IDashboardSummary>;
