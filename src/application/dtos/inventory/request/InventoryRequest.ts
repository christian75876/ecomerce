export interface ICreateInventoryMovementRequest {
  productId: string;
  movementType: 'IN' | 'ADJUSTMENT';
  quantity: number;
  note?: string;
}
