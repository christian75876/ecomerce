import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { IProduct } from './ProductResponse';

export interface IMarketplaceSections {
  newestProducts: IProduct[];
  bestSellingProducts: IProduct[];
}

export type IMarketplaceSectionsResp = IApiResponse<IMarketplaceSections>;
