export interface IProductsQuery {
  search?: string;
  categoryId?: string;
  storeId?: string;
  active?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'random';
  seed?: string;
  sponsoredOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  limit?: number;
  page?: number;
}

export interface ICreateProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  categoryId: string;
  storeId?: string;
  menuCategoryId?: string;
  cost?: number;
  initialStock?: number;
  supplierId?: string;
  imageUrl?: string;
  compareAtPrice?: number;
  showStock?: boolean;
  isActive?: boolean;
  isPerishable?: boolean;
  trackBatches?: boolean;
  lowStockThreshold?: number;
  initialExpiresAt?: string;
  brand?: string;
  tags?: string[];
  unit?: string;
  weight?: number;
  weightUnit?: string;
  width?: number;
  height?: number;
  depth?: number;
  dimensionsUnit?: string;
}

export type IUpdateProductRequest = Partial<ICreateProductRequest>;

export interface ICreateProductVariantRequest {
  size?: string;
  color?: string;
  colorHex?: string;
  sku?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}

export type IUpdateProductVariantRequest = Partial<ICreateProductVariantRequest>;
