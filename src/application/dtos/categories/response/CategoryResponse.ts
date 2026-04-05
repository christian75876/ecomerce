import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ICategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ICategoriesResp = IApiResponse<ICategory[]>;
export type ICategoryResp = IApiResponse<ICategory>;
