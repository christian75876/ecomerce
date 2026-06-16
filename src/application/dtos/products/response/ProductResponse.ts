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
  compareAtPrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
  lowStockThreshold: number | null;
  categoryId: string;
  storeId: string | null;
  supplierId: string | null;
  menuCategoryId: string | null;
  menuCategory: { id: string; name: string; sortOrder: number } | null;
  availableQuantity: number;
  averageRating: number | null;
  reviewCount: number;
  category: ICategory;
  store: IStore | null;
  supplier: ISupplier | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface IProductVideo {
  id: string;
  productId: string;
  videoUrl: string;
  videoType: 'YOUTUBE' | 'INSTAGRAM';
  title: string | null;
  order: number;
  createdAt: string;
}

export type IProductsResp = IApiResponse<IProduct[]>;
export type IProductImagesResp = IApiResponse<IProductImage[]>;
export type IProductImageResp = IApiResponse<IProductImage>;
export type IProductResp = IApiResponse<IProduct>;
export type IProductVideosResp = IApiResponse<IProductVideo[]>;
export type IProductVideoResp = IApiResponse<IProductVideo>;
