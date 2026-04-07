import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number | null;
  imageUrl: string | null;
  isActive: boolean;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
  categoryId: string;
  storeId: string | null;
  supplierId: string | null;
  category: ICategory;
  store: IStore | null;
  supplier: ISupplier | null;
  createdAt: string;
  updatedAt: string;
}

export type IProductsResp = IApiResponse<IProduct[]>;
export type IProductResp = IApiResponse<IProduct>;
