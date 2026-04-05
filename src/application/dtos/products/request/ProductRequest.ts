export interface IProductsQuery {
  search?: string;
  categoryId?: string;
  active?: boolean;
}

export interface ICreateProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  showStock?: boolean;
  isActive?: boolean;
}

export type IUpdateProductRequest = Partial<ICreateProductRequest>;
