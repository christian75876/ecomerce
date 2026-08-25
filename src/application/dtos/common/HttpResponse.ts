export interface IApiResponse<T> {
  success?: boolean;
  statusCode: number;
  message: string;
  data: T;
  resource?: string;
  method?: string;
  timeStamp?: string;
  metadata?: IMetaData | null;
}

export interface IMetaData {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaginatedData<T> {
  items: T[];
  pagination: IMetaData;
}

/** Some list endpoints return pagination fields flat on the payload instead of nested under `pagination` — this matches that shape. */
export interface IFlatPaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
