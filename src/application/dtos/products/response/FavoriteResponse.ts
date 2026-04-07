import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { IProduct } from './ProductResponse';

export type IFavoriteProductsResp = IApiResponse<IProduct[]>;
export type IFavoriteIdsResp = IApiResponse<string[]>;
