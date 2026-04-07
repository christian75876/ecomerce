export interface ICreateInventoryMovementRequest {
  productId: string;
  movementType: 'IN' | 'ADJUSTMENT';
  quantity: number;
  note?: string;
}

export interface ICreateInventoryEntryRequest {
  productId: string;
  supplierId?: string;
  quantity: number;
  unitCost: number;
  receivedAt?: string;
  expiresAt?: string;
  batchCode?: string;
  note?: string;
}
