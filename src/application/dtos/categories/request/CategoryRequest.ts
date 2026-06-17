export interface ICreateCategoryRequest {
  name: string;
  isActive?: boolean;
  storeId?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  isActive?: boolean;
}
