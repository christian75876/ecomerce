import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ICategory {
  id: string;
  name: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Página pública /categorias/:slug: categorías de todas las tiendas agrupadas por nombre. */
export interface ICategoryCollection {
  slug: string;
  name: string;
  productCount: number;
  storeCount: number;
  /** Precio final con IVA. */
  minPrice: number | null;
  maxPrice: number | null;
  lastModified: string | null;
  /** false = muy pocos productos: la página va con noindex. */
  indexable: boolean;
}

export type ICategoriesResp = IApiResponse<ICategory[]>;
export type ICategoryCollectionsResp = IApiResponse<ICategoryCollection[]>;
export type ICategoryCollectionResp = IApiResponse<ICategoryCollection>;
export type ICategoryResp = IApiResponse<ICategory>;
