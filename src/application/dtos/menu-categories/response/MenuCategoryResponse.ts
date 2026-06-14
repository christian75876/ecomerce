import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IMenuCategory {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type IMenuCategoriesResp = IApiResponse<IMenuCategory[]>;
export type IMenuCategoryResp = IApiResponse<IMenuCategory>;
