import { IApiResponse, IPaginatedData } from '@/application/dtos/common/HttpResponse';
import {
  Purchase as DomainPurchase,
  PurchasePaymentMethod,
  PurchaseStatus,
} from '@/domain/models/purchases/Purchase';

export type IPurchase = DomainPurchase;

export type IPurchasesResp = IApiResponse<IPaginatedData<IPurchase>>;
export type IPurchaseResp = IApiResponse<IPurchase>;
export type { PurchaseStatus, PurchasePaymentMethod };
