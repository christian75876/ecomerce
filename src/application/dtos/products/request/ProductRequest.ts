export interface IProductsQuery {
  search?: string;
  categoryId?: string;
  storeId?: string;
  active?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ICreateProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  categoryId: string;
  storeId?: string;
  cost?: number;
  initialStock?: number;
  supplierId?: string;
  imageUrl?: string;
  compareAtPrice?: number;
  showStock?: boolean;
  isActive?: boolean;
  isPerishable?: boolean;
  trackBatches?: boolean;
  initialExpiresAt?: string;
}

export type IUpdateProductRequest = Partial<ICreateProductRequest>;
