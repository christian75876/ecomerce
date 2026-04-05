import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IInventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  isActive: boolean;
  stock: number;
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
}

export type IInventoryResp = IApiResponse<IInventoryItem[]>;
export type IInventoryMovementsResp = IApiResponse<IInventoryMovement[]>;
export type IInventoryMovementResp = IApiResponse<IInventoryMovement>;
