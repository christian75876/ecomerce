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
