import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IDashboardFilters {
  startDate: string;
  endDate: string;
  storeId: string | null;
  criticalStockThreshold: number;
  rotationDays: number;
}

export interface IDashboardStoreOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface IDashboardKpis {
  totalProducts: number;
  salesToday: number;
  salesThisPeriod: number;
  posRevenue: number;
  onlineRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  pendingOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  noRotationProducts: number;
  stockUnits: number;
  customerDebt: number;
  supplierDebt: number;
  openCashSessions: number;
  inventoryEntries: number;
}

export interface IDashboardSalesPoint {
  label: string;
  pos: number;
  online: number;
  total: number;
}

export interface IDashboardTopProduct {
  productId: string;
  name: string;
  categoryName: string;
  storeName: string;
  quantity: number;
  revenue: number;
}

export interface IDashboardTopCategory {
  categoryId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface IDashboardChannelComparison {
  channel: 'POS' | 'ONLINE';
  count: number;
  revenue: number;
}

export interface IDashboardInventoryFlowPoint {
  label: string;
  inbound: number;
  outbound: number;
  adjustments: number;
  net: number;
}

export interface IDashboardStockAlertItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  storeName: string;
  categoryName: string;
}

export interface IDashboardReceivableItem {
  customerId: string;
  name: string;
  email: string;
  balance: number;
  creditLimit: number | null;
  lastPaymentAt: string | null;
}

export interface IDashboardPayableItem {
  supplierId: string;
  name: string;
  balance: number;
  lastPurchaseAt: string | null;
  lastPaidAmount: number;
}

export interface IDashboardLatestOrder {
  id: string;
  status: string;
  total: number;
  customerName: string;
}

export interface IDashboardAnalytics {
  filters: IDashboardFilters;
  availableStores: IDashboardStoreOption[];
  kpis: IDashboardKpis;
  salesByPeriod: IDashboardSalesPoint[];
  topProducts: IDashboardTopProduct[];
  topCategories: IDashboardTopCategory[];
  channelComparison: IDashboardChannelComparison[];
  inventoryFlow: IDashboardInventoryFlowPoint[];
  stockAlerts: {
    critical: IDashboardStockAlertItem[];
    outOfStock: IDashboardStockAlertItem[];
    noRotation: IDashboardStockAlertItem[];
  };
  receivables: {
    totalOutstanding: number;
    customersWithDebt: number;
    items: IDashboardReceivableItem[];
  };
  payables: {
    totalOutstanding: number;
    suppliersWithDebt: number;
    items: IDashboardPayableItem[];
  };
  cashOverview: {
    openSessions: number;
    closedSessions: number;
    manualMovementsTotal: number;
  };
  purchasesOverview: {
    totalPurchases: number;
    purchaseVolume: number;
  };
  latestOrders: IDashboardLatestOrder[];
}

export interface IDashboardAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  storeId?: string;
  criticalStockThreshold?: number;
  rotationDays?: number;
}

export type IDashboardAnalyticsResp = IApiResponse<IDashboardAnalytics>;
