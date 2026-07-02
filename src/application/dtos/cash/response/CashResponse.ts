import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ICashSession {
  id: string;
  storeId: string;
  userId: number;
  openingAmount: number;
  expectedAmount: number;
  closingAmount: number | null;
  difference: number | null;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ICashMovement {
  id: string;
  cashSessionId: string;
  type: 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT';
  amount: number;
  reason: string;
  createdAt: string;
}

export type ICashSessionsResp = IApiResponse<ICashSession[]>;
export type ICashSessionResp = IApiResponse<ICashSession>;
export type ICashMovementsResp = IApiResponse<ICashMovement[]>;
export type ICashMovementResp = IApiResponse<ICashMovement>;
