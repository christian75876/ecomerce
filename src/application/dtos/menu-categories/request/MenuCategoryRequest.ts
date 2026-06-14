export interface ICreateMenuCategoryRequest {
  storeId: string;
  name: string;
  sortOrder?: number;
}

export interface IUpdateMenuCategoryRequest {
  name?: string;
  sortOrder?: number;
}
