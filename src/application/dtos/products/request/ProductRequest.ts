export interface IProductsQuery {
  search?: string;
  categoryId?: string;
  storeId?: string;
  active?: boolean;
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
  showStock?: boolean;
  isActive?: boolean;
}

export type IUpdateProductRequest = Partial<ICreateProductRequest>;
