import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  showStock: boolean;
  categoryId: string;
  category: ICategory;
  createdAt: string;
  updatedAt: string;
}

export type IProductsResp = IApiResponse<IProduct[]>;
export type IProductResp = IApiResponse<IProduct>;
