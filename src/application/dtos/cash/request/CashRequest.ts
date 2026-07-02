export interface IOpenCashSessionRequest {
  storeId: string;
  openingAmount: number;
}

export interface ICloseCashSessionRequest {
  closingAmount: number;
}

export interface ICreateCashMovementRequest {
  type: 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT';
  amount: number;
  reason: string;
}
