import { IApiResponse, IPaginatedData } from '@/application/dtos/common/HttpResponse';

export interface IInventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  isActive: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
  stock: number;
  activeBatchCount: number;
  nextExpiration: string | null;
  inventoryValue: number;
  lowStockThreshold: number | null;
}

export interface IInventoryMovement {
  id: string;
  productId: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'ORDER' | 'ORDER_CANCEL';
  quantityDelta: number;
  note: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  batch: {
    id: string;
    batchCode: string | null;
    expiresAt: string | null;
  } | null;
}

export interface IInventoryBatch {
  id: string;
  productId: string;
  storeId: string | null;
  supplierId: string | null;
  purchaseId: string | null;
  purchaseItemId: string | null;
  batchCode: string | null;
  receivedAt: string;
  expiresAt: string | null;
  unitCost: number;
  initialQuantity: number;
  availableQuantity: number;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'BLOCKED';
  product: {
    id: string;
    name: string;
    sku: string;
    isPerishable: boolean;
  };
  supplier: {
    id: string;
    name: string;
  } | null;
  store: {
    id: string;
    name: string;
  } | null;
}

export type IInventoryResp = IApiResponse<IPaginatedData<IInventoryItem>>;
export type IInventoryMovementsResp = IApiResponse<IPaginatedData<IInventoryMovement>>;
export type IInventoryMovementResp = IApiResponse<IInventoryMovement>;
export type IInventoryBatchesResp = IApiResponse<IPaginatedData<IInventoryBatch>>;
export type IInventoryBatchResp = IApiResponse<IInventoryBatch>;
