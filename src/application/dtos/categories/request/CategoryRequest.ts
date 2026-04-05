export interface ICreateCategoryRequest {
  name: string;
  isActive?: boolean;
}

export interface IUpdateCategoryRequest {
  name?: string;
  isActive?: boolean;
}
